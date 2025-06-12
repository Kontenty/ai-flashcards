# Architektura UI dla 10xFlashCards

## 1. Przegląd struktury UI

Aplikacja 10xFlashCards została zaprojektowana jako nowoczesna, responsywna aplikacja webowa z podejściem mobile-first. Struktura UI opiera się na następujących założeniach:

- Jednostronicowa aplikacja (SPA) z dynamicznym routingiem
- Responsywny layout z wykorzystaniem CSS Grid i Flexbox
- Spójny system komponentów oparty na Shadcn/ui
- Efektywne zarządzanie stanem aplikacji przez React Query
- Intuicyjna nawigacja z wykorzystaniem sidebar'a
- Pełnoekranowy tryb powtórek
- System powiadomień dla akcji użytkownika
- Zaawansowane formularze z walidacją
- System tagów z autocomplete

## 2. Lista widoków

### 2.1. Widok logowania i rejestracji (/auth)

- **Główny cel**: Uwierzytelnianie użytkowników
- **Kluczowe informacje**:
  - Formularz logowania (email, hasło)
  - Formularz rejestracji (email, hasło, checkbox RODO)
  - Komunikaty błędów walidacji
- **Komponenty**:
  - Formularze z react-hook-form
  - Walidacja pól
  - Przyciski akcji
  - Linki do przełączania między formularzami
- **UX i bezpieczeństwo**:
  - Walidacja w czasie rzeczywistym
  - Zabezpieczenie przed atakami brute force
  - Przejrzyste komunikaty błędów
  - Zapamiętywanie stanu formularza

### 2.2. Dashboard (/dashboard)

- **Główny cel**: Przegląd statystyk i szybki dostęp do funkcji
- **Kluczowe informacje**:
  - Liczba fiszek
  - Statystyki powtórek
  - Ostatnio dodane fiszki
  - Fiszki do powtórki
- **Komponenty**:
  - Widgety statystyk
  - Szybkie akcje
  - Wykresy aktywności
  - Lista ostatnich fiszek
- **UX i dostępność**:
  - Responsywny grid layout
  - Skeleton loading
  - Tooltips z dodatkowymi informacjami
  - Klawiaturowa nawigacja

### 2.3. Lista fiszek (/flashcards)

- **Główny cel**: Zarządzanie fiszkami
- **Kluczowe informacje**:
  - Lista fiszek
  - Filtry i wyszukiwarka
  - Tagi
  - Statystyki powtórek
- **Komponenty**:
  - Lista fiszek
  - Komponent modal do edycji fiszki
  - System tagów z autocomplete
  - Filtry i wyszukiwarka
  - Przyciski akcji (dodaj, usuń, edytuj)
- **UX i dostępność**:
  - Expandable rows dla długich treści
  - Drag & drop dla tagów
  - Klawiaturowa nawigacja
  - Responsywna tabela

### 2.4. Generator fiszek (/flashcards/generate)

- **Główny cel**: Generowanie fiszek przez AI
- **Kluczowe informacje**:
  - Pole tekstowe do wklejenia treści
  - Lista wygenerowanych fiszek
  - Liczniki znaków
- **Komponenty**:
  - Textarea z licznikiem znaków
  - Lista propozycji fiszek
  - Przyciski akcji (akceptuj, edytuj, odrzuć)
  - Modal do edycji fiszki
- **UX i dostępność**:
  - Walidacja w czasie rzeczywistym
  - Progress bar generowania
  - Tooltips z pomocą
  - Responsywny layout

### 2.5. Tryb powtórek (/review)

- **Główny cel**: Przeprowadzanie powtórek
- **Kluczowe informacje**:
  - Treść fiszki
  - Skala ocen 0-5
  - Progress bar
  - Licznik pozostałych fiszek
- **Komponenty**:
  - Karta fiszki
  - Skala ocen
  - Progress bar
  - Przyciski nawigacji
- **UX i dostępność**:
  - Pełnoekranowy tryb
  - Klawiaturowa nawigacja
  - Animacje przejść
  - Responsywny design

### 2.6. Statystyki (/stats)

- **Główny cel**: Przegląd statystyk nauki
- **Kluczowe informacje**:
  - Statystyki per tag
  - Procent poprawnych odpowiedzi
  - Historia powtórek
  - Wykresy aktywności
- **Komponenty**:
  - Wykresy
  - Tabela statystyk
  - Filtry czasowe
  - Eksport danych
- **UX i dostępność**:
  - Interaktywne wykresy
  - Responsywny layout
  - Tooltips z szczegółami
  - Klawiaturowa nawigacja

### 2.7. Ustawienia (/settings)

- **Główny cel**: Konfiguracja konta
- **Kluczowe informacje**:
  - Dane użytkownika
  - Preferencje powtórek
  - Zarządzanie tagami
- **Komponenty**:
  - Formularze ustawień
  - Lista tagów
  - Przyciski akcji
- **UX i dostępność**:
  - Walidacja w czasie rzeczywistym
  - Potwierdzenia zmian
  - Responsywny layout
  - Klawiaturowa nawigacja

## 3. Mapa podróży użytkownika

### 3.1. Rejestracja i pierwsze logowanie

1. Wejście na stronę główną
2. Przejście do rejestracji
3. Wypełnienie formularza z akceptacją RODO
4. Przekierowanie do dashboardu
5. Przegląd statystyk i szybkich akcji

### 3.2. Tworzenie fiszek

1. Wybór metody tworzenia (ręczne/AI)
2. Dla AI:
   - Wklejenie tekstu
   - Generowanie fiszek
   - Przegląd i edycja propozycji
   - Akceptacja fiszek
3. Dla ręcznego:
   - Wypełnienie formularza
   - Dodanie tagów
   - Zapisywanie fiszki

### 3.3. Powtórki

1. Wejście w tryb powtórek
2. Przegląd fiszek sekwencyjnie
3. Ocenianie przypomnienia
4. Podsumowanie sesji
5. Powrót do dashboardu

## 4. Układ i struktura nawigacji

### 4.1. Główna nawigacja

- Sidebar z sekcjami:
  - Dashboard
  - Fiszki
  - Powtórki
  - Statystyki
  - Ustawienia
- Responsywny design z możliwością zwijania
- Wskaźnik aktywnej sekcji
- Szybkie akcje w headerze

### 4.2. Nawigacja kontekstowa

- Breadcrumbs dla głębokich widoków
- Filtry i wyszukiwarka w listach
- Paginacja dla długich list
- Przyciski powrotu w trybie pełnoekranowym

## 5. Kluczowe komponenty

### 5.1. Komponenty formularzy

- Input z walidacją
- Textarea z licznikiem znaków
- Select z wyszukiwaniem
- Checkbox z labelami
- Przyciski akcji

### 5.2. Komponenty list

- Tabela
- System tagów
- Filtry i wyszukiwarka
- Paginacja

### 5.3. Komponenty edycji

- Modal do edycji fiszki

### 5.4. Komponenty powiadomień

- Toast notifications
- Modale potwierdzeń
- Komunikaty błędów
- Loading states
- Progress bars

### 5.5. Komponenty statystyk

- Wykresy interaktywne
- Widgety metryk
- Tabela danych
- Filtry czasowe
- Eksport danych

### 5.6. Komponenty nawigacji

- Sidebar
- Breadcrumbs
- Przyciski akcji
- Menu kontekstowe
- Progress indicators
