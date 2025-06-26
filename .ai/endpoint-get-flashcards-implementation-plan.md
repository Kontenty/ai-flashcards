# Plan wdrożenia API: Flashcards

## 1. Przegląd punktu końcowego

Punkt końcowy REST API `Flashcards` umożliwia użytkownikom zarządzanie ich fiszkami (flashcards):

- Pobieranie listy (z paginacją, filtrowaniem po tagach i wyszukiwaniem pełnotekstowym)
- Tworzenie nowej fiszki
- Pobieranie szczegółów pojedynczej fiszki
- Aktualizację istniejącej fiszki
- Usuwanie fiszki

## 2. Szczegóły żądania

### GET /flashcards

- Metoda HTTP: GET
- URL: `/api/flashcards`
- Parametry zapytania:
  - Wymagane: brak (wszystkie mają wartości domyślne)
  - Opcjonalne:
    - `page` (int, domyślnie 1)
    - `pageSize` (int, domyślnie 20)
    - `tags` (UUID[] – lista ID tagów)
    - `search` (string – pełnotekstowe przeszukiwanie front/back)

### POST /flashcards

- Metoda HTTP: POST
- URL: `/api/flashcards`
- Request Body (JSON):
  ```json
  {
    "front": "string (<=200)",
    "back": "string (<=500)",
    "tagIds": ["UUID", ...]
  }
  ```
- Kody odpowiedzi:
  - 201 – utworzono fiszkę
  - 400 – nieprawidłowe dane wejściowe
  - 401 – nieautoryzowany

### GET /flashcards/{id}

- Metoda HTTP: GET
- URL: `/api/flashcards/{id}`
- Parametry ścieżki:
  - `id` (UUID)
- Kody odpowiedzi:
  - 200 – dane fiszki
  - 401 – nieautoryzowany
  - 404 – nie znaleziono

### PUT /flashcards/{id}

- Metoda HTTP: PUT
- URL: `/api/flashcards/{id}`
- Parametry ścieżki:
  - `id` (UUID)
- Request Body: taki sam jak w POST
- Kody odpowiedzi:
  - 200 – zaktualizowano
  - 400 – nieprawidłowe dane
  - 401 – nieautoryzowany
  - 404 – nie znaleziono

### DELETE /flashcards/{id}

- Metoda HTTP: DELETE
- URL: `/api/flashcards/{id}`
- Parametry ścieżki:
  - `id` (UUID)
- Kody odpowiedzi:
  - 204 – usunięto, brak treści
  - 401 – nieautoryzowany
  - 404 – nie znaleziono

## 3. Wykorzystywane typy

- FlashcardListQueryDto (page, pageSize, tags, search)
- FlashcardListItemDto
- PaginationDto
- FlashcardListResponseDto
- CreateFlashcardCommand
- UpdateFlashcardCommand
- FlashcardDetailDto

## 4. Przepływ danych

1. **Autoryzacja**: `locals.supabase.auth.getUser()` → jeśli brak `user`, zwróć 401.
2. **Walidacja**:
   - GET (query params): Zod → typy i zakresy + preprocessing string→number
   - POST/PUT (body): Zod (front.min/max, back.min/max, tagIds.uuid)
   - ID w ścieżce: Zod.uuid()
3. **Serwis** (`flashcard.service.ts`):
   - listFlashcards(userId, queryDto) → supabase.from('flashcards').eq('user_id', userId).apply search (tsv), filtry tagów (`innerJoin` flashcard_tags), `range` dla paginacji
   - createFlashcard(data) → już istnieje
   - getFlashcardById(userId, id) → supabase.select tags + `.eq('user_id', userId)`
   - updateFlashcard(userId, id, data) → aktualizacja rekordu i powiązań w tabeli `flashcard_tags`
   - deleteFlashcard(userId, id) → supabase.delete().eq('id', id).eq('user_id', userId)
4. **Transformacja** na DTO (mapowanie wyników DB → typy frontendowe)
5. **Odpowiedź**: `new Response(JSON.stringify(dto), { status, headers })`

## 5. Względy bezpieczeństwa

- **Uwierzytelnianie**: każdy endpoint sprawdza `supabase.auth.getUser()` → 401
- **Autoryzacja**: filtrowanie po `user_id` → żadne dane innych użytkowników
- **Walidacja** inputów przy pomocy Zod (chroni przed SQLi, XSS)
- **Pełnotekstowe wyszukiwanie**: użycie TSVECTOR z indeksami w bazie (Brak podatności SQLi)

## 6. Obsługa błędów

- 400 – błędy walidacji (szczegóły w odpowiedzi)
- 401 – brak/nieprawidłowy token
- 404 – brak zasobu lub tagów (w POST przy weryfikacji tagIds)
- 500 – nieoczekiwany błąd serwera (logService.error)

Każdy błąd należy zalogować za pomocą `logService` przed zwróceniem odpowiedzi.

## 7. Rozważania dotyczące wydajności

- **Indeksy**: kolumna `tsv` ma indeks GIN (pełnotekstowe wyszukiwanie)
- **Paginacja**: użycie `range` zamiast offset/limit przy większych zbiorach
- **Łączenie tagów**: ograniczyć liczbę JOINów, ew. cache tagów lub liczenia w zewnętrznym serwisie

## 8. Kroki implementacji

1. **Service**:
   - Rozszerzyć `flashcard.service.ts` o metody: `listFlashcards`, `getFlashcardById`, `updateFlashcard`, `deleteFlashcard`.
2. **Walidacja**:
   - Zdefiniować w `src/pages/api/flashcards/index.ts` i `src/pages/api/flashcards/[id].ts` Zod schematy:
     - Query params dla GET listy
     - Body schema dla POST/PUT
     - Parametr ścieżki UUID
3. **Routing**:
   - W `src/pages/api/flashcards/index.ts`: zaimplementować handlery GET i POST
   - Utworzyć `src/pages/api/flashcards/[id].ts` z handlerami GET, PUT, DELETE
4. **Logowanie**:
   - W każdym handlerze błędów wywołać `logService.error` lub `logService.warn`
5. **Testy integracyjne**:
   - Sprawdzić scenariusze happy path i przypadki brzegowe (walidacja, auth, not found)
6. **Dokumentacja**:
   - Zaktualizować OpenAPI spec w `src/pages/api/docs/openapi.yaml`
7. **Code review & merge**
8. **Deploy**

---

_Zgodnie z wytycznymi: kody statusów, z użyciem Astro API Routes, Zod, Supabase SDK oraz logService._
