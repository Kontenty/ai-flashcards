# API Endpoint Implementation Plan: POST /flashcards/generate

## 1. Przegląd punktu końcowego

Endpoint służy do generowania sugestii fiszek za pomocą usługi AI na podstawie dostarczonego tekstu użytkownika. Nie zapisuje wyników w bazie – zwraca jedynie propozycje do dalszej akcji.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Ścieżka URL: `/api/flashcards/generate` (plik: `src/pages/api/flashcards/generate.ts`)
- Nagłówki:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- Parametry:
  - Wymagane:
    - `text` (string) – surowy tekst ≤5000 znaków
  - Opcjonalne: brak
- Body (JSON):
  ```json
  {
    "text": "string (max 5000 chars)"
  }
  ```

## 3. Wykorzystywane typy

- `GenerateFlashcardsRequestDto`
- `SuggestionDto`
- `GenerateFlashcardsResponseDto`

## 4. Szczegóły odpowiedzi

- 200 OK
  ```json
  {
    "suggestions": [
      { "front": "string", "back": "string" },
      ...
    ]
  }
  ```
- 400 Bad Request – brak pola `text` lub przekroczono limit
- 401 Unauthorized – brak lub nieprawidłowy token
- 502 Bad Gateway – błąd usługi AI
- 500 Internal Server Error – nieoczekiwany błąd serwera

## 5. Przepływ danych

1. **Middleware** (`src/middleware/index.ts`) inicjalizuje `locals.supabase` i weryfikuje JWT.
2. **API Route** `src/pages/api/flashcards/generate.ts`:
   - Odczyt i parsowanie JSON requestu.
   - Walidacja `text` za pomocą Zod.
   - Sprawdzenie autoryzacji przez `locals.supabase.auth.getUser()`.
   - Wywołanie serwisu AI: `aiService.generateFlashcards(text)`.
   - Mapowanie odpowiedzi na tablicę `SuggestionDto`.
   - Zwrócenie JSON z kodem 200.

## 6. Względy bezpieczeństwa

- Uwierzytelnianie: wymóg nagłówka `Authorization` i weryfikacja przez Supabase Auth.
- Autoryzacja: ograniczenie dostępu tylko dla zalogowanych użytkowników.
- Walidacja danych wejściowych: Zod (`text.max(5000)`) chroni przed nadmiernym użyciem pamięci.
- Ochrona przed DDoS / rate limiting (zalecenie implementacji w middleware lub warstwie proxy).

## 7. Obsługa błędów

| Kod | Przyczyna                         | Opis                                          |
| --- | --------------------------------- | --------------------------------------------- |
| 400 | Walidacja Zod                     | Nieprawidłowy lub brakujący `text`.           |
| 401 | Brak tokena / Nieprawidłowy token | Użytkownik nieautoryzowany.                   |
| 502 | Błąd serwisu AI                   | Timeout, limit API lub niepoprawna odpowiedź. |
| 500 | Błąd wewnętrzny                   | Inny nieoczekiwany problem.                   |

## 8. Rozważania dotyczące wydajności

- Weryfikacja rozmiaru `text` już na poziomie middleware lub serwisu.
- Ograniczenie równoległych zapytań do usługi AI (throttling).
- Możliwość cache'owania sugestii dla tego samego wejścia w krótkim okresie.
- Zarządzanie timeoutem HTTP na wywołaniu do AI.

## 9. Kroki implementacji

1. Utworzyć Zod-schema w `src/lib/validators/generateFlashcards.schema.ts`.
2. Napisać serwis AI w `src/lib/services/ai.service.ts` z funkcją `generateFlashcards(text: string): Promise<SuggestionDto[]>`.
3. Dodać wpis `export const prerender = false` w pliku endpointu.
4. Stworzyć plik endpointu `src/pages/api/flashcards/generate.ts`.
5. Importować i użyć Zod-schema, typy DTO, oraz `locals.supabase` zgodnie z regułami.
6. Obsłużyć błędy walidacji, autoryzacji i zwrócić odpowiednie kody.
7. Przetestować endpoint: przypadki pozytywne i negatywne.
8. Dodać dokumentację w Swagger/OpenAPI (opcjonalnie).
