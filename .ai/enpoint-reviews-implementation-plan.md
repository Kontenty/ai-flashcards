# API Endpoint Implementation Plan: Reviews Endpoints

## 1. Przegląd punktu końcowego

### GET /api/reviews/session

- Celu: Pobranie listy fiszek zaplanowanych do powtórki dla zalogowanego użytkownika na bieżący dzień.

### POST /api/flashcards/{id}/review

- Celu: Przesłanie wyniku powtórki pojedynczej fiszki. Wywołuje funkcję SQL `process_flashcard_review`, która aktualizuje parametry SM-2 (`interval`, `ease_factor`, `next_review_date`) oraz zapisuje historię powtórek.

## 2. Szczegóły żądania

### GET /api/reviews/session

- Metoda HTTP: GET
- Ścieżka: `/api/reviews/session`
- Parametry:
  - Brak parametów URL ani ciała.

### POST /api/flashcards/{id}/review

- Metoda HTTP: POST
- Ścieżka: `/api/flashcards/{id}/review`
- Parametry:
  - Wymagane:
    - `id` (UUID) – identyfikator fiszki w ścieżce URL.
- Ciało żądania (application/json):
  ```json
  {
    "quality": 4 // integer 0–5
  }
  ```

## 3. Wykorzystywane typy

### DTOs

```ts
// src/types/reviews.ts
export interface ReviewCardDTO {
  id: string;
  front: string;
  back: string;
}

export interface GetReviewSessionResponseDTO {
  cards: ReviewCardDTO[];
}

export interface SubmitReviewRequestDTO {
  quality: number; // 0–5
}

export interface SubmitReviewResponseDTO {
  message: string;
}
```

### Command/Service Models

- `ReviewSessionCommand` – no pola, reprezentuje żądanie GET
- `SubmitReviewCommand` – `{ flashcardId: string; quality: number; }`

## 4. Szczegóły odpowiedzi

### GET /api/reviews/session

- Kod statusu: 200 OK
- Body:
  ```json
  {
    "cards": [
      { "id": "uuid", "front": "string", "back": "string" }
      // ...
    ]
  }
  ```

### POST /api/flashcards/{id}/review

- Kod statusu: 200 OK
- Body:
  ```json
  {
    "message": "Review processed successfully."
  }
  ```

## 5. Przepływ danych

1. **GET /api/reviews/session**

   - Middleware uwierzytelniające dodaje `context.locals.supabase` z sesją użytkownika.
   - Handler (`pages/api/reviews/session.ts`) wywołuje `ReviewService.getDueFlashcards()`.
   - `ReviewService.getDueFlashcards()` używa `supabase.from('flashcards')`
     z filtrami: `user_id = auth.uid()`, `next_review_date <= CURRENT_DATE`.
   - Mapowanie wyniku do `ReviewCardDTO[]` i zwrot `GetReviewSessionResponseDTO`.

2. **POST /api/flashcards/{id}/review**
   - Middleware uwierzytelniające zapewnia `supabase` i `auth.uid()`.
   - Handler (`pages/api/flashcards/[id]/review.ts`) parsuje i waliduje `id` z URL oraz `quality` z ciała OpenAPI schema.
   - Wywołanie `ReviewService.processReview({ flashcardId, quality })`.
   - `ReviewService.processReview()` używa `supabase.rpc('process_flashcard_review', { p_flashcard_id, p_quality })`.
   - W razie błędu funkcji SQL – rzuca wyjątek.
   - Zwraca `SubmitReviewResponseDTO`.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: wszystkie endpointy wymagają zalogowanego użytkownika. Wykorzystanie middleware Astro z `supabase.auth`.
- **Autoryzacja**: row-level security (RLS) w Supabase na tabelach `flashcards` i `flashcard_reviews` gwarantuje, że operacje dotyczą tylko zasobów bieżącego użytkownika.
- **Walidacja wejścia**:
  - Ścieżka `id`: musi być zgodny z UUID (Zod .uuid()).
  - `quality`: integer 0–5 (Zod .int().min(0).max(5)).
- **Ochrona przed atakami**: brak czystego SQL – użycie supabase-js i RPC, chroni przed SQL injection.

## 7. Obsługa błędów

| Kod | Warunek                                                     | Działanie                                                    |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| 400 | Niepoprawne dane wejściowe (walidacja Zod nie powiodła się) | Zwraca JSON z opisem błędu walidacji i loguje warn.          |
| 404 | Brak fiszki o danym `id`                                    | Zwraca `{ message: 'Flashcard not found' }`.                 |
| 401 | Brak sesji użytkownika                                      | Zwraca `{ message: 'Unauthorized' }`.                        |
| 500 | Błąd wewnętrzny serwera (np. błąd RPC lub sieci)            | Zwraca `{ message: 'Internal server error' }`, loguje error. |

## 8. Rozważania dotyczące wydajności

- **Indeksy**: tabela `flashcards` ma indeks na `next_review_date` i `user_id`.
- **Batchowanie**: jeśli liczba fiszek dziennie jest bardzo duża, rozważyć paginację albo limit w zapytaniu.
- **Cache**: opcjonalnie cachować odpowiedzi GET (TTL na kilka minut).
- **RPC**: praca SM-2 odbywa się po stronie bazy, co minimalizuje ruch sieciowy.

## 9. Kroki implementacji

1. **Zdefiniować schematy walidacji**:

   - `src/lib/validators/review.schema.ts` z Zod:

     ```ts
     import { z } from "zod";

     export const submitReviewSchema = z.object({
       quality: z.number().int().min(0).max(5),
     });

     export const reviewParamsSchema = z.object({
       id: z.string().uuid(),
     });
     ```

2. **Utworzyć plik typów** `src/types/reviews.ts` z DTOs.

3. **Implementować `ReviewService`**:

   - Plik: `src/lib/services/review.service.ts`.
   - Metody:
     - `getDueFlashcards(): Promise<ReviewCardDTO[]>`
     - `processReview(cmd: SubmitReviewCommand): Promise<void>`

4. **Dodanie endpointów**:

   - `src/pages/api/reviews/session.ts` (GET)
   - `src/pages/api/flashcards/[id]/review.ts` (POST)
   - W każdym: import użytkownika z `context.locals.supabase`, walidacja Zod, wywołanie serwisu, odpowiedź.

5. **Rejestrowanie błędów**:

   - W przypadku błędów walidacji: `logService.warn('Validation error', { errors })`.
   - W przypadku 500: `logService.error('Review endpoint error', { error })`.

6. **Testy jednostkowe**:

   - `tests/unit/services/review.service.test.ts` – mock supabase, sprawdzić zachowanie `getDueFlashcards` i `processReview`.

7. **Testy end-to-end**:

   - `tests/e2e/reviewsSession.spec.ts` – sprawdzić GET bez sesji, GET z sesją, POST poprawne i błędy.

8. **Dokumentacja**:

   - Zaktualizować OpenAPI/Swagger jeśli używany.

9. **Code review & merge**

---
