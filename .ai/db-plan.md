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
- **name** VARCHAR(50) NOT NULL UNIQUE
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()

### flashcard_tags

- **flashcard_id** UUID NOT NULL  
  ‣ FOREIGN KEY REFERENCES flashcards(id) ON DELETE CASCADE
- **tag_id** UUID NOT NULL  
  ‣ FOREIGN KEY REFERENCES tags(id) ON DELETE CASCADE
- PRIMARY KEY (flashcard_id, tag_id)

---

## 2. Relacje

- auth.users 1 → N flashcards (via flashcards.user_id)
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

- UNIQUE INDEX na `tags(name)` (wynika z UNIQUE CONSTRAINT)

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

> **Uwaga:** tabela `tags` jest globalna (brak kolumny `user_id`), RLS nie jest na niej wymagana.

---

## 5. Dodatkowe uwagi

- Uwierzytelnianie Supabase Auth; dodatkowe pola użytkownika (`first_name`, `last_name`, `email`, `rodo_accepted_at`) trzymane w `auth.users.user_metadata`.
- Limity znaków front/back wymuszane przez typy `VARCHAR(200)` i `VARCHAR(500)`.
- Pełnotekstowe wyszukiwanie w języku angielskim (można zmienić na `'simple'` lub `'polish'` według potrzeby).
- Statystyki (liczba fiszek per tag, procent poprawnych powtórek) obliczane w locie przez widoki (np. `tag_statistics`, `card_performance`).
- Backupy i monitoring bazy zgodnie z polityką RODO w Supabase.

```

```
