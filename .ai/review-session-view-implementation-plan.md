# Plan implementacji widoku "Sesja powtórek"

## 1. Przegląd

Widok "Sesja powtórek" pozwala użytkownikowi przeprowadzić sekwencyjną powtórkę fiszek zgodnie z algorytmem SM-2: pobiera karty zaplanowane na dziś (lub przefiltrowane po tagach), wyświetla je w kolejności, umożliwia ocenę przypomnienia w skali 0-5, a po zakończeniu prezentuje podsumowanie sesji i link powrotu do dashboardu.

## 2. Routing widoku

- Strona startowa sesji: `/reviews`
- Sesja z wybranymi tagami (opcjonalnie): `/reviews?tags=uuid,uuid`
- Po zakończeniu powrót na `/dashboard`

## 3. Struktura komponentów

```
ReviewsPage (Astro page)
└─ ReviewSessionProvider (context + hook)
   ├─ ReviewStartPanel
   │   ├─ TagMultiSelect (src\components\flashcards\TagSelector.tsx)
   │   └─ StartButton
   ├─ ReviewCardPanel (render conditional)
   │   ├─ FlashcardFrontBack
   │   └─ RatingBar (buttons 0-5)
   └─ ReviewSummaryPanel (render conditional)
```

## 4. Szczegóły komponentów

### ReviewStartPanel

- **Opis**: Ekran startowy; umożliwia wybór tagów lub rozpoczęcie sesji z domyślną listą „do powtórki”.
- **Elementy**: `MultiSelect` (`ui/multi-select.tsx`), `Button` (`ui/button.tsx`).
- **Interakcje**: wybór tagów, klik „Rozpocznij sesję”.
- **Walidacja**: brak – pusta lista tagów oznacza tryb „wszystkie zaległe”.
- **Typy**: `TagDto[]` (z API `/api/tags`), `string[]` (selectedTagIds).
- **Propsy**: brak (część kontekstu).

### ReviewCardPanel

- **Opis**: Główna część sesji; wyświetla kolejno fiszki i umożliwia ocenę.
- **Elementy**: `FlashcardFrontBack` (obsługuje flip), `RatingBar` (sześć przycisków), `Progress` (`ui/progress.tsx`).
- **Interakcje**:
  1. Flip karty (klik na kartę lub przycisk „Pokaż odpowiedź”).
  2. Ocena 0-5 – wysyła `POST /api/flashcards/{id}/review`.
- **Walidacja**: blokada ocen przed odwróceniem karty; `quality` ∈ \[0,5].
- **Typy**: `ReviewCardDto`, `ReviewRequestDto`.
- **Propsy**: brak – pobiera stan z kontekstu.

### FlashcardFrontBack

- **Opis**: Prezentuje front lub back karty z animacją flip.
- **Elementy**: `card.tsx` z Tailwind kl. flip.
- **Interakcje**: onClick → toggleSide.
- **Walidacja**: –
- **Typy**: `{ front: string; back: string; side: "front" | "back" }`.
- **Propsy**: `card`, `side`, `onFlip`.

### RatingBar

- **Opis**: Paski/przyciski 0-5 z etykietami.
- **Interakcje**: onClick(rate) → `submitReview` w kontekście.
- **Walidacja**: disabled gdy `isSubmitting`.
- **Typy**: `number (0-5)`.
- **Propsy**: `disabled`.

### ReviewSummaryPanel

- **Opis**: Podsumowanie po ostatniej karcie – liczba kart, średnia ocena, % poprawnych.
- **Elementy**: `StatsTile`, `Button` „Powrót do dashboardu”.
- **Interakcje**: klik → `navigate('/dashboard')`.
- **Walidacja**: –
- **Typy**: `SummaryStats` (zdef. niżej).
- **Propsy**: brak.

## 5. Typy

```ts
// Widoczne tylko w frontendzie
interface ReviewSessionState {
  cards: ReviewCardDto[]; // lista z API GET /api/reviews/session
  currentIndex: number; // aktualna karta
  side: "front" | "back"; // widoczna strona
  submitted: Record<string, number>; // flashcardId → quality
  summary?: SummaryStats; // wypełniane po zakończeniu
}

interface SummaryStats {
  total: number;
  averageQuality: number; // 0-5
  correctPercentage: number; // quality ≥3
}
```

Typy DTO używamy z `@/types`:

- `ReviewCardDto` (GET `/api/reviews/session`)
- `ReviewRequestDto` (POST `/api/flashcards/{id}/review`)

## 6. Zarządzanie stanem

`ReviewSessionProvider` (React context + hook `useReviewSession`) przechowuje `ReviewSessionState` oraz metody:

- `startSession(tagIds?: string[])` → fetch GET `/api/reviews/session?tags=...`.
- `flip()`.
- `rate(quality: 0-5)` → `POST /api/flashcards/{id}/review`, zapis do `submitted`, przejście do następnej karty lub summary.
  Kontekst udostępnia `state`, `actions` dla dzieci.

## 7. Integracja API

1. **GET `/api/reviews/session`**
   - Query: `tags?` (ciąg uuid,client-side join ",").
   - Response: `200` → `ReviewSessionResponseDto`; `204` → brak kart.
2. **POST `/api/flashcards/{id}/review`**
   - Body: `ReviewRequestDto` { quality }.
   - Obsługa błędów: `400`, `404`, `401` → toast z `sonner.tsx`.

## 8. Interakcje użytkownika

1. Użytkownik otwiera `/reviews` → ReviewStartPanel.
2. (Opc.) wybiera tagi → klik „Rozpocznij sesję”.
3. Aplikacja pobiera karty; jeśli `204`, pokazuje komunikat „Brak fiszek do powtórek”.
4. Wyświetla front 1. karty.
5. Klik na kartę → back.
6. Klik oceny → wysyłka POST, przejście do kolejnej.
7. Po ostatniej karcie → ReviewSummaryPanel.
8. Klik „Powrót” → nawigacja do dashboardu.

## 9. Warunki i walidacja

- `quality` musi być liczbą całkowitą 0-5 (walidacja po stronie komponentu RatingBar).
- Oceny aktywne dopiero po flip.
- Blokada przycisków podczas `isSubmitting` (POST in-flight).
- Jeśli GET zwróci 401 → redirect do `/auth/login`.

## 10. Obsługa błędów

| Scenariusz           | Reakcja UI                                           |
| -------------------- | ---------------------------------------------------- |
| 204 brak kart        | Alert/EmptyState component z ikoną + przycisk „Wróć” |
| 401 z obu endpointów | `logout()` + redirect do login                       |
| 400 / 404 przy POST  | Toast „Nie udało się zapisać oceny” + przycisk ponów |
| Network error        | Toast retry, automatyczne ponowienie po 5 s          |

## 11. Kroki implementacji

1. **Routing**: zaktualizuj `src/pages/reviews.astro` aby wyrenderować `<ReviewsPage>` komponent Reacta.
2. **Konfiguracja context**: utwórz `src/hooks/useReviewSession.ts` zgodnie z sekcją 6.
3. **Komponenty UI**:
   1. `ReviewStartPanel.tsx`
   2. `ReviewCardPanel.tsx` (wewnątrz `FlashcardFrontBack.tsx`, `RatingBar.tsx`)
   3. `ReviewSummaryPanel.tsx`
4. **Integracja MultiSelect**: wykorzystaj istniejący `ui/multi-select.tsx` do wyboru tagów (fetch `/api/tags`).
5. **Animacja flip**: Tailwind + CSS perspective w komponencie `FlashcardFrontBack`.
6. **API utilities**: w `src/lib/services/reviewSession.service.ts` dodaj metody `fetchSession`, `submitReview` (wrappers over fetch).
7. **Sonner toasts**: użyj `ui/sonner.tsx` do komunikatów sukces/błąd.
8. **Testy**:
   - Jednostkowe hooka `useReviewSession` (Vitest ✅ / ❌ states).
   - E2E Playwright: happy path + brak kart + błąd 401.
9. **Dokumentacja**: zaktualizuj README sekcję „Views”.
10. **Code review & merge**.
