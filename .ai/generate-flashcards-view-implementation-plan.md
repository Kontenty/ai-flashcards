# Plan implementacji widoku generowania fiszek AI

## 1. Przegląd

Widok generowania fiszek AI umożliwia użytkownikom tworzenie fiszek edukacyjnych z wykorzystaniem sztucznej inteligencji. Użytkownik wprowadza tekst źródłowy, a system generuje propozycje fiszek, które można zaakceptować, edytować lub odrzucić. Widok zapewnia intuicyjny interfejs z walidacją w czasie rzeczywistym, wskaźnikiem postępu i responsywnym układem.

## 2. Routing widoku

```
/flashcards/generate
```

## 3. Struktura komponentów

```
GenerateFlashcardsView
├── TextInputSection
│   ├── TextareaWithCounter
│   ├── GenerateButton
│   └── ProgressIndicator
├── FlashcardList
│   ├── FlashcardItem
│   │   ├── CardContent
│   │   └── ActionButtons
│   └── BulkSaveButton
│   └── EmptyState
└── EditCardModal
    ├── Form
    │   ├── InputWithCounter
    │   └── ValidationMessage
    └── ModalActions
```

## 4. Szczegóły komponentów

### TextInputSection

- Opis komponentu: Sekcja zawierająca pole tekstowe do wprowadzania treści źródłowej
- Główne elementy:
  - Textarea z licznikiem znaków
  - Przycisk generowania
  - Wskaźnik postępu
  - Komunikat o błędzie
- Obsługiwane interakcje:
  - Wprowadzanie tekstu
  - Kliknięcie przycisku generowania
  - Walidacja w czasie rzeczywistym
- Obsługiwana walidacja:
  - Maksymalna długość tekstu (5000 znaków)
  - Puste pole
- Typy:
  - GenerateFlashcardsRequestDto
  - GenerateFlashcardsResponseDto
- Propsy:
  - onGenerate: (text: string) => Promise<void>
  - isGenerating: boolean
  - error: string | null

### FlashcardList

- Opis komponentu: Lista wygenerowanych fiszek z możliwością akcji
- Główne elementy:
  - Lista fiszek
  - Przyciski akcji dla każdej fiszki
  - Przycisk zapisujący wszystkie zaakceptowane fiszki
  - Stan pusty
  - Stan ładowania
- Obsługiwane interakcje:
  - Akceptacja fiszki
  - Edycja fiszki
  - Odrzucenie fiszki
  - Zapisanie wszystkich zaakceptowanych fiszek
- Obsługiwana walidacja:
  - Sprawdzanie limitów znaków
  - Walidacja wymaganych pól
- Typy:
  - SuggestionDto[]
  - CreateFlashcardCommand
- Propsy:
  - suggestions: SuggestionDto[]
  - onAccept: (index: number) => void
  - onEdit: (index: number) => void
  - onReject: (index: number) => void

### EditCardModal

- Opis komponentu: Modal do edycji wygenerowanej fiszki
- Główne elementy:
  - Formularz edycji
  - Pola front/back z licznikami
  - Przyciski akcji
  - Komunikaty walidacji
- Obsługiwane interakcje:
  - Edycja pól
  - Zatwierdzenie zmian
  - Anulowanie
- Obsługiwana walidacja:
  - Front ≤200 znaków
  - Back ≤500 znaków
  - Wymagane pola
- Typy:
  - SuggestionDto
  - CreateFlashcardCommand
- Propsy:
  - isOpen: boolean
  - card: SuggestionDto
  - onSave: (card: CreateFlashcardCommand) => void
  - onClose: () => void

## 5. Typy

```typescript
interface GenerateFlashcardsViewModel {
  text: string;
  isGenerating: boolean;
  error: string | null;
  suggestions: SuggestionDto[];
}

interface EditCardViewModel {
  front: string;
  back: string;
  isOpen: boolean;
  cardIndex: number;
}

interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
}
```

## 6. Zarządzanie stanem

Widok wykorzystuje następujące hooki:

- useGenerateFlashcards:

  - Zarządzanie stanem generowania
  - Obsługa API
  - Walidacja tekstu

- useEditCard:

  - Stan modalu
  - Walidacja pól
  - Obsługa zapisu

- useValidation:
  - Walidacja w czasie rzeczywistym
  - Komunikaty błędów
  - Stan walidacji

## 7. Integracja API

### Generowanie fiszek

```typescript
POST /flashcards/generate
Request: { text: string }
Response: { suggestions: SuggestionDto[] }
```

### Zapisywanie fiszki

```typescript
POST / flashcards;
Request: CreateFlashcardCommand;
Response: FlashcardDetailDto;
```

## 8. Interakcje użytkownika

1. Wprowadzanie tekstu:

   - Walidacja w czasie rzeczywistym
   - Licznik znaków
   - Komunikaty błędów

2. Generowanie fiszek:

   - Wskaźnik postępu
   - Obsługa błędów
   - Aktualizacja listy

3. Zarządzanie fiszkami:
   - Akceptacja
   - Edycja w modalu
   - Odrzucenie
   - Komponent 'BulkSaveButton' wysłanie zaakceptowanych fiszek do zapisania w bazie

## 9. Warunki i walidacja

1. Pole tekstowe:

   - Maksymalnie 5000 znaków
   - Nie może być puste

2. Fiszki:

   - Front: maksymalnie 200 znaków
   - Back: maksymalnie 500 znaków
   - Oba pola wymagane

3. API:
   - Walidacja odpowiedzi
   - Obsługa błędów
   - Rate limiting

## 10. Obsługa błędów

1. Błędy API:

   - Komunikaty dla użytkownika
   - Możliwość ponowienia
   - Logowanie błędów

2. Błędy walidacji:

   - Komunikaty w czasie rzeczywistym
   - Blokada akcji
   - Podpowiedzi poprawy

3. Błędy sieciowe:
   - Wskaźnik offline
   - Możliwość ponowienia
   - Cache danych

## 11. Kroki implementacji

1. Przygotowanie struktury:

   - Utworzenie komponentów
   - Definicja typów
   - Konfiguracja routingu

2. Implementacja TextInputSection:

   - Pole tekstowe z licznikiem
   - Przycisk generowania
   - Walidacja

3. Implementacja FlashcardList:

   - Lista fiszek
   - Przyciski akcji
   - Stany pusty/ładowanie

4. Implementacja EditCardModal:

   - Formularz edycji
   - Walidacja pól
   - Obsługa zapisu

5. Integracja API:

   - Endpoint generowania
   - Endpoint zapisu
   - Obsługa błędów

6. Testy i optymalizacja:
   - Testy komponentów
   - Testy integracyjne
   - Optymalizacja wydajności
