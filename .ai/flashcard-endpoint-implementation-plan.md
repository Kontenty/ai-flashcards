# API Endpoint Implementation Plan: Create Flashcard

## 1. Przegląd punktu końcowego

Endpoint służy do tworzenia nowych fiszek, zarówno ręcznie jak i poprzez akceptację sugestii AI. Endpoint obsługuje podstawowe dane fiszki (przód, tył) oraz powiązanie z tagami.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Struktura URL: /api/flashcards
- Parametry:
  - Wymagane:
    - front (string, max 200 znaków)
    - back (string, max 500 znaków)
    - tagIds (array of UUIDs)
  - Opcjonalne: brak
- Request Body:

```json
{
  "front": "string",
  "back": "string",
  "tagIds": ["UUID"]
}
```

## 3. Wykorzystywane typy

```typescript
// Command model dla tworzenia fiszki
type CreateFlashcardCommand = {
  front: string;
  back: string;
  tagIds: string[];
};

// DTO dla odpowiedzi
type FlashcardDetailDto = {
  id: string;
  front: string;
  back: string;
  tags: string[];
  next_review_date: Date;
};
```

## 4. Szczegóły odpowiedzi

- Status: 201 Created
- Response Body:

```json
{
  "id": "UUID",
  "front": "string",
  "back": "string",
  "tags": ["string"],
  "next_review_date": "date"
}
```

## 5. Przepływ danych

1. Walidacja żądania:

   - Sprawdzenie obecności wymaganych pól
   - Walidacja długości pól
   - Walidacja formatu UUID dla tagIds

2. Sprawdzenie uprawnień:

   - Weryfikacja tokenu JWT
   - Pobranie user_id z tokenu

3. Walidacja tagów:

   - Sprawdzenie czy wszystkie tagi istnieją
   - Weryfikacja dostępu do tagów

4. Tworzenie fiszki:

   - Wstawienie rekordu do tabeli flashcards
   - Utworzenie powiązań w tabeli flashcard_tags
   - Pobranie utworzonej fiszki z powiązanymi tagami

5. Formatowanie odpowiedzi:
   - Mapowanie danych do DTO
   - Zwrócenie odpowiedzi 201

## 6. Względy bezpieczeństwa

1. Uwierzytelnianie:

   - Wymagany token JWT
   - Weryfikacja tokenu przez Supabase

2. Autoryzacja:

   - Row Level Security w Supabase
   - Sprawdzenie dostępu do tagów

3. Walidacja danych:

   - Sanityzacja inputów
   - Walidacja długości pól
   - Sprawdzenie formatu UUID

4. Bezpieczeństwo bazy danych:
   - Użycie parametrów zapytań
   - Transakcje dla operacji wielotabelowych

## 7. Obsługa błędów

1. Błędy walidacji (400):

   - Brakujące wymagane pola
   - Nieprawidłowa długość pól
   - Nieprawidłowy format UUID

2. Błędy autoryzacji (401):

   - Brak tokenu
   - Nieprawidłowy token
   - Wygaśnięty token

3. Błędy zasobów (404):

   - Tagi nie istnieją
   - Brak dostępu do tagów

4. Błędy serwera (500):
   - Błędy bazy danych
   - Nieoczekiwane błędy

## 8. Rozważania dotyczące wydajności

1. Optymalizacje bazy danych:

   - Indeksy na kolumnach id, user_id
   - Efektywne zapytania JOIN
   - Użycie transakcji

2. Caching:

   - Cache tagów (opcjonalnie)
   - Cache użytkownika

3. Monitoring:
   - Logowanie czasu wykonania
   - Metryki błędów
   - Monitorowanie użycia zasobów

## 9. Etapy wdrożenia

1. Przygotowanie środowiska:

   - Utworzenie pliku endpointu w src/pages/api/flashcards.ts
   - Konfiguracja middleware autoryzacji

2. Implementacja walidacji:

   - Utworzenie schematu Zod
   - Implementacja middleware walidacji

3. Implementacja serwisu:

   - Utworzenie FlashcardService
   - Implementacja metod CRUD
   - Obsługa transakcji

4. Implementacja endpointu:

   - Obsługa żądania POST
   - Integracja z serwisem
   - Formatowanie odpowiedzi

5. Testy:

   - Testy jednostkowe serwisu
   - Testy integracyjne endpointu
   - Testy wydajnościowe

6. Dokumentacja:

   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia
   - Dokumentacja błędów

7. Wdrożenie:
   - Code review
   - Testy na środowisku staging
   - Wdrożenie na produkcję
