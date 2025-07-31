# API Endpoint Implementation Plan: GET /reviews/session

## 1. Przegląd punktu końcowego

Punkt końcowy pozwala uwierzytelnionemu użytkownikowi pobrać listę kart do dzisiejszego przeglądu według algorytmu SM-2.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- Ścieżka: `/reviews/session`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
- Parametry:
  - Wymagane: brak
  - Opcjonalne:
    - `history` (boolean) – opcjonalny filtr historii przeglądów (można zostawić na future feature)

## 3. Wykorzystywane typy

- **ReviewSessionCardDto**
  ```ts
  interface ReviewSessionCardDto {
    id: string;
    front: string;
    interval: number;
    ease_factor: number;
  }
  ```
- **ReviewSessionResponseDto**
  ```ts
  interface ReviewSessionResponseDto {
    cards: ReviewSessionCardDto[];
  }
  ```

## 4. Szczegóły odpowiedzi

- 200 OK
  ```json
  {
    "cards": [
      {
        "id": "UUID",
        "front": "string",
        "interval": 5,
        "ease_factor": 2.6
      }
    ]
  }
  ```
- 204 No Content — brak kart do przeglądu
- 401 Unauthorized — brak lub nieprawidłowy token
- 500 Internal Server Error — błąd serwera lub bazy danych

## 5. Przepływ danych

1. **Middleware/auth** (w `src/middleware/index.ts`):
   - Weryfikacja JWT przez Supabase Auth.
   - Pobranie `userId` i `supabase` z `context.locals`.
2. **Handler GET** (`src/pages/api/reviews/session.ts`):
   - Odczyt optionalnego parametru `history`.
   - Wywołanie `reviewService.getDueCards(userId, { history })`.
3. **reviewService.getDueCards** (`src/lib/services/review.service.ts`):
   - Query do tabeli `flashcards` z
     ```sql
     WHERE user_id = :userId
       AND next_review_date <= current_date
     ORDER BY next_review_date ASC
     ```
   - Mapowanie wierszy na `ReviewSessionCardDto`.
4. **Response**:
   - Jeżeli lista niepusta → zwróć 200 z DTO.
   - Jeżeli pusta → zwróć 204 No Content.

## 6. Względy bezpieczeństwa

- Uwierzytelnienie: token JWT z Supabase Auth.
- Autoryzacja: RLS na tabeli `flashcards` (`user_id`).
- Ekspozycja danych: zwracać tylko pola `id`, `front`, `interval`, `ease_factor`.
- Ochrona przed DoS: rozważyć limit na liczbę zwracanych kart (np. 100).

## 7. Obsługa błędów

- **401**: brak/nieprawidłowy token.
- **204**: brak kart due.
- **500**:
  - Błąd połączenia z bazą, timeout, nieoczekiwany wyjątek.
  - Dodatkowo: w catch bloku wywołać `logService.error(error)`.

## 8. Rozważania dotyczące wydajności

- Indeks po `user_id` i `next_review_date` (istnieje idx_flashcards_user_id i GIN na tsv, ale warto rozważyć dodatkowy indeks na `(user_id, next_review_date)`).
- Eager load minimalnych pól.
- Opcjonalna paginacja lub limitowanie (np. `LIMIT 100`).

## 9. Kroki implementacji

1. Utworzyć plik `src/lib/services/review.service.ts`.
2. Zaimplementować w nim metodę `getDueCards(userId: string, opts?: { history?: boolean })`.
3. W handlerze `src/pages/api/reviews/session.ts`:
   - Zaimportować i użyć `reviewService.getDueCards`.
   - Dostosować implementację stub → właściwe wywołanie service.
4. Dodać obsługę kodu 204, 500 oraz catch z `logService.error`.
5. Dodać testy jednostkowe dla service (Vitest) i test E2E (Playwright) na endpoint:
   - Scenariusz: użytkownik z kartami due → 200 z listą.
   - Scenariusz: użytkownik bez kart due → 204.
   - Scenariusz: brak tokena → 401.
6. Zweryfikować i, jeśli potrzebne, dodać indeks na `(user_id, next_review_date)`.
