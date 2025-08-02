# Schemat bazy danych 10xFlashCards

## 1. Tabele

### flashcards

- **id** UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- **user_id** UUID NOT NULL  
  ‣ FOREIGN KEY REFERENCES auth.users(id) ON DELETE CASCADE
- **front** VARCHAR(200) NOT NULL
- **back** VARCHAR(500) NOT NULL
- **source** TEXT
- **ease_factor** NUMERIC(4,2) NOT NULL DEFAULT 2.5
- **interval** INTEGER NOT NULL DEFAULT 1
- **next_review_date** DATE NOT NULL DEFAULT CURRENT_DATE
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **tsv** TSVECTOR GENERATED ALWAYS AS (
  to_tsvector('english', front || ' ' || back)
  ) STORED

### tags

- **id** UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- **user_id** UUID NOT NULL
  ‣ FOREIGN KEY REFERENCES auth.users(id) ON DELETE CASCADE
- **name** VARCHAR(50) NOT NULL
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- UNIQUE (user_id, name)

### flashcard_tags

- **flashcard_id** UUID NOT NULL  
  ‣ FOREIGN KEY REFERENCES flashcards(id) ON DELETE CASCADE
- **tag_id** UUID NOT NULL  
  ‣ FOREIGN KEY REFERENCES tags(id) ON DELETE CASCADE
- PRIMARY KEY (flashcard_id, tag_id)

---

## 2. Relacje

- auth.users 1 → N flashcards (via flashcards.user_id)
- auth.users 1 → N tags (via tags.user_id)
- flashcards N ↔ N tags (via flashcard_tags)

---

## 3. Indeksy

- B-tree na `flashcards(user_id)`

  ```sql
  CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
  ```

- GIN na `tsv` w tabeli flashcards

  ```sql
  CREATE INDEX idx_flashcards_tsv ON flashcards USING GIN(tsv);
  ```

- UNIQUE INDEX na `tags(user_id, name)` (wynika z UNIQUE CONSTRAINT)

---

## 4. Polityki RLS

### flashcards

```sql
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_flashcards ON flashcards
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY insert_flashcards ON flashcards
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY update_flashcards ON flashcards
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY delete_flashcards ON flashcards
  FOR DELETE USING (user_id = auth.uid());
```

### tags

```sql
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_tags ON tags
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY insert_tags ON tags
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY update_tags ON tags
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY delete_tags ON tags
  FOR DELETE USING (user_id = auth.uid());
```

### flashcard_tags

```sql
ALTER TABLE flashcard_tags ENABLE ROW LEVEL SECURITY;

-- SELECT
CREATE POLICY select_flashcard_tags ON flashcard_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM flashcards
      WHERE flashcards.id = flashcard_tags.flashcard_id
        AND flashcards.user_id = auth.uid()
    )
  );

-- INSERT
CREATE POLICY insert_flashcard_tags ON flashcard_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM flashcards
      WHERE flashcards.id = flashcard_tags.flashcard_id
        AND flashcards.user_id = auth.uid()
    )
  );

-- DELETE
CREATE POLICY delete_flashcard_tags ON flashcard_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM flashcards
      WHERE flashcards.id = flashcard_tags.flashcard_id
        AND flashcards.user_id = auth.uid()
    )
  );
```

---

## 5. Widoki (Views)

### daily_review_stats

Ten widok pokazuje dzienne statystyki powtórek dla bieżącego tygodnia (od poniedziałku).

```sql
CREATE OR REPLACE VIEW daily_review_stats AS
SELECT
    date(reviewed_at) AS review_date,
    COUNT(id) AS cards_reviewed,
    -- Używamy rzutowania, aby uniknąć problemów z precyzją w niektórych klientach SQL
    ROUND(AVG(quality), 2) AS mean_quality
FROM
    flashcard_reviews
WHERE
    -- Filtrujemy dane dla bieżącego tygodnia (zaczynając od poniedziałku)
    reviewed_at >= date_trunc('week', CURRENT_DATE)
GROUP BY
    date(reviewed_at)
ORDER BY
    review_date;

-- Polityka RLS na tabeli bazowej `flashcard_reviews` automatycznie
-- filtruje dane dla zalogowanego użytkownika.
-- Dodatkowo, nadajemy uprawnienia do odczytu dla zalogowanych użytkowników.
GRANT SELECT ON daily_review_stats TO authenticated;
```

> **Uwaga:** Widok `daily_review_stats` jest zabezpieczony przez politykę RLS nałożoną na tabelę `flashcard_reviews`. Użytkownicy widzą tylko swoje własne statystyki.

---

## 6. Algorytm powtórek (SM-2)

### 6.1. Parametry w tabeli `flashcards`

- `ease_factor` NUMERIC(4,2) — współczynnik łatwości karty (min 1.3, domyślne 2.5).
- `interval` INTEGER — aktualny interwał w dniach.
- `next_review_date` DATE — data zaplanowanej kolejnej powtórki.

### 6.2. Tabela `flashcard_reviews` (historia powtórek)

| Kolumna      | Typ          | Ograniczenia                                         |
| ------------ | ------------ | ---------------------------------------------------- |
| id           | UUID         | PRIMARY KEY DEFAULT uuid_generate_v4()               |
| flashcard_id | UUID         | NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE |
| user_id      | UUID         | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE |
| quality      | SMALLINT     | NOT NULL CHECK (quality BETWEEN 0 AND 5)             |
| reviewed_at  | TIMESTAMPTZ  | NOT NULL DEFAULT now()                               |
| interval     | INTEGER      | NOT NULL                                             |
| ease_factor  | NUMERIC(4,2) | NOT NULL                                             |

> **Uwaga dot. projektu:** Kolumna `user_id` jest zdenormalizowana (można ją uzyskać przez JOIN z `flashcards`). Zostało to zrobione celowo w celu uproszczenia zapytań i polityk RLS, co zwiększa wydajność. Integralność danych jest zapewniona w ramach funkcji `process_flashcard_review`.

> **Uwaga dot. niezmienności:** Rekordy w tej tabeli są niezmienne z perspektywy użytkownika. Nie można ich modyfikować ani usuwać, aby zachować integralność historii nauki.

Indeks:

```sql
CREATE INDEX idx_flashcard_reviews_flashcard_id ON flashcard_reviews(flashcard_id);
```

### 6.3. Funkcja `process_flashcard_review`

```sql
CREATE OR REPLACE FUNCTION process_flashcard_review(
  p_flashcard_id UUID,
  p_quality SMALLINT
) RETURNS VOID AS $$
DECLARE
  v_card flashcards%ROWTYPE;
  v_new_interval INTEGER;
  v_new_ef NUMERIC(4,2);
BEGIN
  IF p_quality < 0 OR p_quality > 5 THEN
    RAISE EXCEPTION 'quality must be between 0 and 5';
  END IF;

  SELECT * INTO v_card FROM flashcards
  WHERE id = p_flashcard_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Flashcard not found';
  END IF;

  -- Algorytm SM-2
  IF p_quality < 3 THEN
    v_new_interval := 1;
  ELSE
    IF v_card.interval = 1 THEN
      v_new_interval := 6; -- druga udana odpowiedź
    ELSE
      v_new_interval := ceil(v_card.interval * v_card.ease_factor);
    END IF;
  END IF;

  v_new_ef := greatest(1.3, v_card.ease_factor + (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02)));

  INSERT INTO flashcard_reviews (
    flashcard_id, user_id, quality, reviewed_at,
    interval, ease_factor
  ) VALUES (
    p_flashcard_id, auth.uid(), p_quality, now(),
    v_new_interval, v_new_ef
  );

  UPDATE flashcards
  SET interval = v_new_interval,
      ease_factor = v_new_ef,
      next_review_date = current_date + v_new_interval,
      updated_at = now()
  WHERE id = p_flashcard_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION process_flashcard_review(UUID, SMALLINT) TO authenticated;
```

### 6.4. RLS dla `flashcard_reviews`

```sql
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_flashcard_reviews ON flashcard_reviews
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY insert_flashcard_reviews ON flashcard_reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

> **Uwaga:** Brak polityk `UPDATE` i `DELETE` jest celowy, aby zapewnić niezmienność historii powtórek.

## 7. Dodatkowe uwagi

- Uwierzytelnianie Supabase Auth; dodatkowe pola użytkownika (`first_name`, `last_name`, `email`, `rodo_accepted_at`) trzymane w `auth.users.user_metadata`.
- Limity znaków front/back wymuszane przez typy `VARCHAR(200)` i `VARCHAR(500)`.
- Pełnotekstowe wyszukiwanie w języku angielskim (można zmienić na `'simple'` lub `'polish'` według potrzeby).
- Statystyki (liczba fiszek per tag, procent poprawnych powtórek) obliczane w locie przez widoki (np. `tag_statistics`, `card_performance`).
- Backupy i monitoring bazy zgodnie z polityką RODO w Supabase.
