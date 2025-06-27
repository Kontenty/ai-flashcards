# API Endpoint Implementation Plan: Tags

## 1. Przegląd punktu końcowego

Endpointy REST do zarządzania globalnymi tagami:

- **GET /tags**: lista i wyszukiwanie tagów
- **POST /tags**: tworzenie tagu
- **PUT /tags/{id}**: aktualizacja nazwy tagu
- **DELETE /tags/{id}**: usunięcie tagu oraz powiązań z flashcards

## 2. Szczegóły żądania

- Metoda HTTP i URL:
  - GET /tags
  - POST /tags
  - PUT /tags/{id}
  - DELETE /tags/{id}
- Parametry:
  - **GET**:
    - opcjonalny query param `search`: string (filtrowanie po nazwie)
  - **POST/PUT**:
    - path param `id` (dla PUT i DELETE): UUID
    - body JSON: `{ "name": string }`
- Nagłówki:
  - `Content-Type: application/json` dla POST/PUT
  - `Authorization: Bearer <token>` dla operacji modyfikujących

## 3. Wykorzystywane typy

- **DTO**:
  - `TagDto` ({ id: string, name: string })
  - `TagQueryDto` ({ search?: string })
- **Command**:
  - `CreateTagCommand` ({ name: string })
  - `UpdateTagCommand` ({ name: string })

## 4. Szczegóły odpowiedzi

- **GET /tags**
  - 200 OK: `TagDto[]`
- **POST /tags**
  - 201 Created: `TagDto`
- **PUT /tags/{id}**
  - 200 OK: `TagDto`
- **DELETE /tags/{id}**
  - 204 No Content
- **Kody błędów**:
  - 400 Bad Request (walidacja/Zod lub duplicate name)
  - 401 Unauthorized (brak/nieprawidłowy token)
  - 404 Not Found (nie istnieje tag o danym id)
  - 500 Internal Server Error

## 5. Przepływ danych

1. Żądanie trafia do plików API w `src/pages/api/tags`:
   - `index.ts` ⇒ GET, POST
   - `[id].ts` ⇒ PUT, DELETE
2. Middleware `src/middleware/index.ts` ładuje Supabase i sesję:
   - `context.locals.supabase`
3. Walidacja danych wejściowych w `src/lib/validators/tag.schema.ts` przy pomocy Zod
4. Wywołanie metod serwisu w `src/lib/services/tag.service.ts`:
   - `list(search?)`, `create(command)`, `update(id, command)`, `delete(id)`
5. Serwis wykonuje zapytania do Supabase na tabeli `tags`
6. Wyniki zwracane do klienta z odpowiednim kodem HTTP i ciałem odpowiedzi

## 6. Względy bezpieczeństwa

- Operacje **POST**, **PUT**, **DELETE** wymagają uwierzytelnienia.
- Użyć `context.locals.supabase.auth.getUser()` do weryfikacji użytkownika.
- Globalne tagi nie mają RLS, ale write endpoints chronić tokenem.
- Wszystkie dane wejściowe walidować i sanitować przez Zod.

## 7. Obsługa błędów

- **Walidacja Zod** ⇒ 400 z detalami błędów.
- **Duplicate name**: przy kodzie błędu SQL `23505` zwrócić 400 z czytelnym komunikatem.
- **Brak zasobu** (update/delete nic nie zmienia) ⇒ 404 Not Found.
- **Brak autoryzacji** ⇒ 401 Unauthorized.
- **Nieoczekiwany wyjątek** ⇒ log.error(err) + 500 Internal Server Error.

## 8. Rozważania dotyczące wydajności

- Indeks GIN na kolumnie TSVECTOR (`tsv`) wspiera szybkie wyszukiwanie.
- W razie dużej liczby tagów dodać paginację (limit/offset) w GET.
- Opcjonalnie: cache zwracanych tagów przez `cache.service`.

## 9. Kroki implementacji

1. Utworzyć schematy Zod w `src/lib/validators/tag.schema.ts`.
2. Rozszerzyć/utworzyć metody w `src/lib/services/tag.service.ts`:
   - `list`, `create`, `update`, `delete`.
3. Utworzyć pliki API:
   - `src/pages/api/tags/index.ts` (GET, POST)
   - `src/pages/api/tags/[id].ts` (PUT, DELETE)
4. W endpointach zaimportować:
   - Zod schematy, DTO/Command z `src/types.ts`
   - `tag.service`, `log.service`
5. Zaimplementować walidację, obsługę błędów oraz wywołania serwisu.
6. Dodać middleware uwierzytelniający dla POST/PUT/DELETE.
7. Napisać testy integracyjne i jednostkowe dla wszystkich scenariuszy.
8. Zaktualizować dokumentację OpenAPI w `src/pages/api/docs/openapi.yaml`.
9. Opcjonalnie: wdrożyć paginację i cache.
