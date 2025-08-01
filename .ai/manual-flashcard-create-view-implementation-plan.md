# Plan implementacji widoku Ręczne tworzenie fiszek

## 1. Przegląd

Widok umożliwia użytkownikowi ręczne tworzenie pojedynczej fiszki poprzez uzupełnienie pól „Front” oraz „Back” i przypisanie opcjonalnych tagów. Formularz jest prezentowany w modalu otwieranym z pulpitu (`DashboardView`). Po zapisaniu fiszka jest tworzona poprzez `POST /api/flashcards`, a UI informuje o powodzeniu operacji i odświeża statystyki pulpitu.

## 2. Routing widoku

Widok nie wymaga osobnej trasy. Modal jest otwierany na stronie `/dashboard`. Dla bezpośredniego linkowania i zachowania historii można dodać query param `?modal=createFlashcard`, który przy pierwszym renderze strony otworzy modal automatycznie.

## 3. Struktura komponentów

```
DashboardView
└── CreateFlashcardModal (nowy)
    ├── FlashcardCreationForm (nowy)
    │   ├── Textarea front
    │   ├── Textarea back
    │   └── TagSelector (istniejący lub nowy)
    └── DialogFooter (przyciski „Anuluj”, „Zapisz”)
```

## 4. Szczegóły komponentów

### CreateFlashcardModal

- **Opis**: Kontener typu `Dialog` z nagłówkiem, treścią i przyciskami. Zarządza otwarciem/zamknięciem, przekazuje akcję zapisu do formularza.
- **Główne elementy**: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `FlashcardCreationForm`, `DialogFooter`.
- **Obsługiwane interakcje**:
  - zamknięcie: klik „x”, klik tła, `Esc`
  - zapis: klik „Zapisz” lub `Ctrl+Enter`
- **Walidacja**: delegowana do `FlashcardCreationForm`.
- **Typy**: brak własnych – używa `CreateFlashcardCommand`.
- **Propsy**:
  - `open: boolean`
  - `onClose(): void`
  - `onCreated(): void` – callback po udanym zapisie (np. do `reload()` danych).

### FlashcardCreationForm

- **Opis**: Kontrolowany formularz z polami front/back i selektorem tagów. Odpowiada za walidację i przygotowanie requestu.
- **Główne elementy**: dwa `Textarea`, `TagSelector`, licznik znaków, alert błędu.
- **Obsługiwane interakcje**: zmiana wartości, dodanie/utworzenie tagu, `Ctrl+Enter` do zapisu.
- **Walidacja**:
  - `front`: required, length 1–200
  - `back`: required, length 1–500
- **Typy**:
  - lokalny `FlashcardFormState`:
    ```ts
    interface FlashcardFormState {
      front: string;
      back: string;
      selectedTags: TagOption[]; // z hooka useTags
    }
    ```
- **Propsy**:
  - `disabled: boolean` – sterowane przez modal podczas zapisu.
  - `onSubmit(cmd: CreateFlashcardCommand): Promise<void>`

### TagSelector (rozszerzenie `useTags`)

- **Opis**: Komponent multiselect oparty o Shadcn/ui (`Combobox` lub `Popover + Command`). Pozwala wyszukać istniejące tagi oraz utworzyć nowy, gdy brak wyników.
- **Główne elementy**: `Input`, `CommandList`, `CommandItem`, przycisk „+ Utwórz”.
- **Obsługiwane interakcje**: wybór, odznaczanie, dodawanie nowego.
- **Walidacja**: brak (opcjonalne pole).
- **Typy**: `TagOption`.
- **Propsy**:
  - `value: TagOption[]`
  - `onChange(value: TagOption[]): void`

## 5. Typy

1. **CreateFlashcardCommand** – już zdefiniowany w `src/types/types.dto.ts`.
2. **TagOption** – z hooka `useTags`.
3. **FlashcardFormState** – lokalny stan formularza (patrz wyżej).

## 6. Zarządzanie stanem

- `DashboardView`
  - `showCreateModal` (`boolean`)
- `CreateFlashcardModal`
  - `isSaving` (`boolean`)
  - deleguje stan pól do `FlashcardCreationForm`
- `FlashcardCreationForm`
  - `state: FlashcardFormState`
  - `error: string | null`

Hooki:

- `useTags()` – już istnieje, zapewnia listę tagów, CRUD tagów.
- `useFlashcardCreate()` (NOWY)
  ```ts
  function useFlashcardCreate() {
    const [loading, setLoading] = useState(false);
    const create = async (cmd: CreateFlashcardCommand) => {
      /* POST */
    };
    return { create, loading };
  }
  ```

## 7. Integracja API

- Endpoint: `POST /api/flashcards`
- Request body: `CreateFlashcardCommand`
- Response 201: `FlashcardDetailDto` (nie musi być w pełni wykorzystywana – wystarczy potwierdzenie).
- Po sukcesie:
  1. Zamknij modal
  2. Wyświetl `toast.success("Utworzono fiszkę")`
  3. Wywołaj `reload()` dashboardu, aby odświeżyć statystyki/listy

## 8. Interakcje użytkownika

1. Użytkownik klika „Dodaj fiszkę” w sekcji QuickActions → `showCreateModal = true`.
2. Modal pojawia się z pustymi polami.
3. Użytkownik wpisuje front/back.
4. (Opcjonalnie) wybiera istniejące tagi lub tworzy nowe.
5. Klik „Zapisz” / `Ctrl+Enter`:
   - Walidacja pól
   - Wywołanie `POST /api/flashcards`
6. Po sukcesie modal znika, `toast` potwierdza, dashboard `reload()`.
7. W przypadku błędu wyświetlany jest `Alert` z treścią błędu + `toast.error`.

## 9. Warunki i walidacja

| Pole  | Reguła              | Komponent             |
| ----- | ------------------- | --------------------- |
| front | required, ≤200 char | FlashcardCreationForm |
| back  | required, ≤500 char | FlashcardCreationForm |
| tags  | opcjonalne, UUID    | TagSelector           |

Dodatkowe: blokada przycisku „Zapisz”, gdy formularz niepoprawny lub trwa `isSaving`.

## 10. Obsługa błędów

- Walidacja klienta: komunikat pod formularzem.
- 400/422 z API: pokazany w `Alert` i `toast.error`.
- 401/403: przekierowanie do `/login` lub globalny handler.
- Sieć/nieznany: ogólny komunikat „Nie udało się zapisać fiszki”.

## 11. Kroki implementacji

1. **QuickActions**
   - Zmień akcję „Dodaj fiszkę” z `href` na callback `onClick` przekazywany do `DashboardView`.
2. **DashboardView**
   - Dodaj `showCreateModal` i funkcję `toggleCreateModal`.
   - Renderuj `<CreateFlashcardModal open={showCreateModal} onClose={…} onCreated={reload} />`.
3. **Utwórz CreateFlashcardModal.tsx** (można skopiować z `EditCardModal` i uprościć).
4. **Utwórz FlashcardCreationForm.tsx** z kontrolowanym stanem.
5. **Rozszerz useTags** lub stwórz `TagSelector.tsx` z możliwością tworzenia tagu.
6. **Utwórz useFlashcardCreate** hook (fetch + error handling).
7. **Dodaj stałe i walidację** – użyj `MAX_FRONT_LENGTH`, `MAX_BACK_LENGTH`.
8. **Dodaj testy jednostkowe**:
   - Walidacja formularza (Vitest + RTL)
   - Hook `useFlashcardCreate` – mock fetch.
9. **Dodaj testy e2e Playwright**:
   - Otwórz dashboard → klik „Dodaj fiszkę” → uzupełnij pola → zapisz → sprawdź toast.
10. **Aktualizuj dokumentację** (README / storybook jeśli istnieje).
11. **Refactor & lint** – uruchom `pnpm lint` oraz `pnpm test`.
