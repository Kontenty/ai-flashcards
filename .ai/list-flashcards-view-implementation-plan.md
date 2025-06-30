# Plan implementacji widoku Zarządzanie fiszkami

## 1. Przegląd

Widok pozwala użytkownikowi na pełne zarządzanie fiszkami: przeglądanie, wyszukiwanie, filtrowanie po tagach, edycję, usuwanie oraz przegląd statystyk powtórek.

## 2. Routing widoku

- Ścieżka: `/flashcards`
- Plik Astro: `src/pages/flashcards/index.astro`, w którym zostanie osadzony komponent React z hydratacją.

## 3. Struktura komponentów

ListFlashcardsView
├─ SearchBar
├─ TagFilter
├─ StatsOverview
├─ FlashcardTable
│ └─ FlashcardRow
├─ PaginationControls
├─ EditCardModal
└─ DeleteConfirmDialog

## 4. Szczegóły komponentów

### SearchBar

- Opis: pole tekstowe do pełnotekstowego wyszukiwania fiszek.
- Elementy: `<input type="text" />`, przycisk czyszczenia.
- Zdarzenia: `onChange(value: string)`; debounce 300 ms.
- Walidacja: max długość 100 znaków.
- Typy: `string`.
- Propsy: `{ value: string; onChange: (v: string) => void }`.

### TagFilter

- Opis: creatable multiselect umożliwiający wybór istniejących tagów i tworzenie nowych.
- Elementy: komponent `Autocomplete` z opcją dodania nowego taga.
- Zdarzenia:
  - `onChange(selectedIds: string[])`
  - `onCreate(name: string)` → wywołuje POST `/api/tags`
- Walidacja: nazwa taga 1–50 znaków.
- Typy:
  - `TagOption { id: string; name: string }`
- Propsy: `{ selected: string[]; onChange: (ids: string[]) => void; onCreate: (name: string) => void; options: TagOption[] }`.

### StatsOverview

- Opis: wyświetla statystyki powtórek (ilość fiszek, procent poprawnych powtórek) oraz liczbę fiszek per tag.
- Elementy: karty/wykresy z danymi.
- Typy:
  - `PerformanceStatsDto { totalReviewed: number; correctPercent: number }`
  - `TagStatisticDto[] { tag: string; count: number }`
- Propsy: `{ stats: PerformanceStatsDto; tagStats: TagStatisticDto[] }`.

### FlashcardTable

- Opis: tabela z listą fiszek.
- Elementy: `<table>` z kolumnami: front, back (skrócone), tags, nextReviewDate, createdAt, akcje.
- Zdarzenia: `onEdit(id: string)`, `onDelete(id: string)`.
- Typy:
  - `FlashcardListItemVM { id: string; front: string; back: string; tags: string[]; nextReviewDate: string; createdAt: string }`
- Propsy: `{ items: FlashcardListItemVM[]; onEdit: (id: string) => void; onDelete: (id: string) => void }`.

### FlashcardRow

- Opis: pojedynczy wiersz tabeli, rozwijalny pokazujący pełne front/back.
- Elementy: komórki tabeli, ikona expand.
- Zdarzenia: `onToggleExpand()`.
- Propsy: `{ item: FlashcardListItemVM }`.

### PaginationControls

- Opis: nawigacja między stronami wyników.
- Elementy: przyciski poprzednia/następna.
- Zdarzenia: `onPageChange(newPage: number)`.
- Typy: `PaginationDto { page: number; pageSize: number; total: number }`.
- Propsy: `{ pagination: PaginationDto; onPageChange: (p: number) => void }`.

### EditCardModal

- Opis: modal z formularzem dodawania/edycji fiszki.
- Elementy: `<textarea>` front, `<textarea>` back, TagFilter, przyciski Zapisz/Anuluj.
- Zdarzenia: `onSubmit(data: EditFlashcardVM)`, `onClose()`.
- Walidacja:
  - front: 1–200 znaków
  - back: 1–500 znaków
  - tagIds.length ≥ 1
- Typy:
  - `EditFlashcardVM { id?: string; front: string; back: string; tagIds: string[] }`
- Propsy: `{ isOpen: boolean; initial?: EditFlashcardVM; onSubmit: (d: EditFlashcardVM) => void; onClose: () => void }`.

### DeleteConfirmDialog

- Opis: modal z potwierdzeniem usunięcia fiszki.
- Elementy: tekst potwierdzający, przyciski Tak/Nie.
- Zdarzenia: `onConfirm()`, `onCancel()`.
- Propsy: `{ isOpen: boolean; onConfirm: () => void; onCancel: () => void }`.

## 5. Typy

- FilterState: `{ page: number; pageSize: number; tags: string[]; search: string }`
- FlashcardListItemVM (z API + `createdAt`)
- EditFlashcardVM
- TagOption
- PerformanceStatsDto, TagStatisticDto[]

## 6. Zarządzanie stanem

- Hook `useFlashcards(filter: FilterState)`:
  - GET `/api/flashcards?page=&pageSize=&tags=&search=`
  - Zwraca: `{ items: FlashcardListItemVM[]; pagination: PaginationDto; loading; error; reload }`
- Hook `useTags()`:
  - GET `/api/tags?search=` → `TagOption[]`
  - POST `/api/tags` → `TagOption`
  - PUT `/api/tags/{id}` → `TagOption`
  - DELETE `/api/tags/{id}` → 204
  - Zwraca: `{ options: TagOption[]; loading; error; createTag(name); updateTag(id,name); deleteTag(id) }`
- Lokalny stan w ListFlashcardsView:
  - `filter: FilterState`
  - `isEditOpen: boolean`, `selectedFlashcard?: EditFlashcardVM`
  - `toDeleteId?: string`
  - `stats: { stats: PerformanceStatsDto; tagStats: TagStatisticDto[] }`

## 7. Integracja API

- Flashcards: GET/POST/PUT/DELETE `/api/flashcards`
- Tagi:
  - GET `/api/tags?search=` → `TagDto[]`
  - POST `/api/tags` (body `{ name }`) → `TagDto`
  - PUT `/api/tags/{id}` (body `{ name }`) → `TagDto`
  - DELETE `/api/tags/{id}` → 204

## 8. Interakcje użytkownika

1. Wpisanie w SearchBar → debounce → odświeżenie listy
2. Zaznaczenie/odznaczenie tagów w TagFilter → odświeżenie
3. Wpisanie nowej nazwy taga w TagFilter → createTag → dodanie do wybranych i dostępnych
4. Kliknięcie Edytuj → otwarcie EditCardModal z danymi
5. Zapis zmodyfikowanej fiszki → walidacja → PUT/POST → zamknięcie + reload
6. Kliknięcie Usuń → DeleteConfirmDialog → DELETE → zamknięcie + reload
7. Rozwinięcie wiersza → pokazanie pełnej treści
8. Nawigacja paginacją → reload nowych danych

## 9. Warunki i walidacja

- search: max 100 znaków
- tag name: 1–50 znaków
- front: 1–200 znaków
- back: 1–500 znaków
- tagIds.length ≥ 1
- page, pageSize > 0
- Obsługa błędnych statusów HTTP zgodnie z API

## 10. Obsługa błędów

- Globalne alerty/toasty (np. Sonner) dla błędów sieciowych
- Inline błędy walidacji pod polami
- Duplikat taga (400) → komunikat „Tag już istnieje”
- 404 → „Nie znaleziono fiszki/taga”
- 500 → „Błąd serwera, spróbuj ponownie”

## 11. Kroki implementacji

1. Utworzyć `src/pages/flashcards/index.astro` i osadzić w nim komponent React (`hydrate`)
2. Stworzyć hooki w `src/hooks/useFlashcards.ts` i `src/hooks/useTags.ts`
3. Zaimplementować `ListFlashcardsView` i zaimportować podkomponenty
4. Stworzyć `SearchBar`, `TagFilter` (z creatable Autocomplete)
5. Stworzyć `StatsOverview` (karty/wykresy)
6. Stworzyć `FlashcardTable` i `FlashcardRow`
7. Dodać `PaginationControls`
8. Zbudować `EditCardModal` i `DeleteConfirmDialog` z walidacją
9. Połączyć hooki z komponentami, zrealizować API calls
10. Dodać debounce, inline validation i obsługę błędów
11. Przetestować scenariusze, poprawić UX i dostępność (ARIA)
