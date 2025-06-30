# Plan testów dla projektu 10x-ai-flashcards

## 1. Wprowadzenie i cele testowania

- Zapewnienie wysokiej jakości i niezawodności aplikacji.
- Weryfikacja zgodności implementacji z wymaganiami biznesowymi.
- Identyfikacja i eliminacja defektów na wczesnym etapie developmentu.
- Ocena wydajności, bezpieczeństwa i użyteczności interfejsu.

## 2. Zakres testów

### 2.1 Testy funkcjonalne

- Autoryzacja i uwierzytelnianie (rejestracja, logowanie, resetowanie hasła, wylogowywanie).
- CRUD fiszek (tworzenie, odczyt, edycja, usuwanie) w UI i przez API.
- Generowanie fiszek z wykorzystaniem AI (/api/flashcards/generate).
- Zarządzanie tagami (dodawanie, edycja, usuwanie, filtrowanie).
- Wyszukiwanie, filtrowanie i paginacja listy fiszek.
- Wyświetlanie statystyk i raportów w komponencie `StatsOverview`.
- Sprawdzenie poprawnego działania komponentów Shadcn/ui i responsywności.

### 2.2 Testy niefunkcjonalne

- Wydajność generowania fiszek (maksymalny czas odpowiedzi API).
- Wydajność ładowania listy fiszek (paginacja) oraz statystyk.
- Bezpieczeństwo (RLS Supabase, rate limiting middleware).
- Testy dostępności (WCAG) i użyteczności UI.

## 3. Typy testów do przeprowadzenia

- Testy jednostkowe: logika serwisów, walidatory (`generateFlashcards.schema.ts`, `tag.schema.ts`), utilsy (`result.ts`).
- Testy integracyjne: integracja z Supabase (emulator lub kontener Docker), endpointy API.
- Testy end-to-end: scenariusze użytkownika w przeglądarce (Playwright).
- Testy wydajnościowe: Lighthouse (UI), k6 (API).
- Testy bezpieczeństwa: weryfikacja RLS, rate limiting (narzędzie do generowania dużego ruchu).
- Testy dostępności: axe-core, Lighthouse.
- Testy manualne UX: eksploracyjne i sprawdzenie zgodności z designem.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Autoryzacja i uwierzytelnianie

1. Rejestracja nowego użytkownika
   - **Kroki:** Przejście do `/register`, wypełnienie poprawnymi danymi, zatwierdzenie.
   - **Oczekiwane:** Konto utworzone; przekierowanie do dashboardu; token w ciasteczku.
2. Logowanie
   - **Kroki:** Przejście do `/login`, podanie poprawnych i niepoprawnych danych.
   - **Oczekiwane:** Poprawne dane → dostęp do chronionych zasobów; błędne → komunikat o błędzie.
3. Resetowanie hasła
   - **Kroki:** `/forgot-password` → wprowadzenie e-mail → link resetujący → zmiana hasła → logowanie.
   - **Oczekiwane:** Email wysłany; możliwe zalogowanie nowym hasłem.
4. Wylogowywanie
   - **Kroki:** Kliknięcie przycisku "Wyloguj" w `UserNav`.
   - **Oczekiwane:** Sesja zakończona; przekierowanie do strony logowania.

### 4.2 Zarządzanie fiszkami

- Tworzenie, edycja, usuwanie fiszek w komponencie `EditCardModal` i `DeleteConfirmDialog`.
- Walidacja pól, poprawność zapisu w Supabase.
- Odczyt listy (`FlashcardList` i `FlashcardTable`) z uwzględnieniem paginacji.

### 4.3 Generowanie fiszek z AI

- Wypełnienie formularza w `GenerateFlashcardsView`, przesłanie do `/api/flashcards/generate`.
- Mockowanie odpowiedzi AI; weryfikacja wyrenderowania nowych fiszek.
- Obsługa błędów z zewnętrznego serwisu AI.

### 4.4 Zarządzanie tagami i filtrowanie

- Dodawanie/usuwanie tagów w `TagFilter` i przez API.
- Filtrowanie listy fiszek po wybranych tagach; aktualizacja paginacji.

### 4.5 Wyszukiwanie i paginacja

- Testy `SearchBar` i `PaginationControls`: wpisanie frazy, zmiana stron.
- Oczekiwane wyniki z serwera, prawidłowa nawigacja między stronami.

### 4.6 Statystyki

- Weryfikacja generowania danych w `StatsOverview` (np. liczba fiszek, popularne tagi).
- Testy API `/api/flashcards/stats` (lub odpowiedni endpoint).

### 4.7 Middleware rate limiting

- Wysyłanie szybkich, kolejnych żądań do dowolnego endpointu API.
- Oczekiwane: po przekroczeniu limitu odpowiedź HTTP 429.

## 5. Środowisko testowe

- Node.js v18+ z TypeScript.
- Supabase emulator lub lokalny kontener Docker z dedykowaną bazą testową.
- Plik `.env.test` z kluczami i URL-em testowego Supabase.
- CI: GitHub Actions uruchamiające testy jednostkowe, integracyjne i E2E.
- Mockowanie usług AI za pomocą MSW lub stubów.

## 6. Narzędzia do testowania

- **Vitest** + **React Testing Library**
- **MSW (Mock Service Worker)**
- **Playwright**
- **Lighthouse** i **axe-core**
- **k6** (testy obciążeniowe API)
- **Postman / Newman** (testy ręczne integracyjne)
- **GitHub Actions** (CI/CD)

## 7. Harmonogram testów

| Faza                      | Zakres                                         | Czas trwania |
| ------------------------- | ---------------------------------------------- | ------------ |
| 1. Testy jednostkowe      | Logika serwisów, walidatory, komponenty UI     | 5 dni        |
| 2. Testy integracyjne     | Endpointy API, integracja z Supabase           | 5 dni        |
| 3. Testy end-to-end (E2E) | Główne ścieżki użytkownika (autoryzacja, CRUD) | 7 dni        |
| 4. Testy niefunkcjonalne  | Wydajność, bezpieczeństwo, dostępność          | 5 dni        |
| 5. Testy regresji         | Cała aplikacja                                 | 3 dni        |

## 8. Kryteria akceptacji testów

- 100% scenariuszy krytycznych zakończonych powodzeniem.
- Pokrycie testami jednostkowymi: backend ≥ 80%, frontend ≥ 70%.
- Brak błędów o priorytecie P0/P1.
- Średni czas odpowiedzi API < 200 ms.
- Czas generowania fiszek < 2 s.

## 9. Role i odpowiedzialności w procesie testowania

- **QA Engineer:** projektowanie i realizacja testów, raportowanie wyników.
- **Developerzy:** naprawa zgłoszonych defektów, wsparcie w analizie błędów.
- **Product Owner:** weryfikacja i akceptacja kryteriów testowych.
- **DevOps:** przygotowanie i utrzymanie środowisk testowych oraz CI.

## 10. Procedury raportowania błędów

- Zgłaszanie w **GitHub Issues** z etykietą `bug`.
- Wypełnienie szablonu: tytuł, kroki odtworzenia, oczekiwany vs rzeczywisty rezultat, zrzuty ekranu/logi.
- Klasyfikacja priorytetów: P0 (blokujące), P1 (krytyczne), P2 (pomniejsze).
- Workflow: zgłoszenie → triage → przypisanie → weryfikacja → zamknięcie.
