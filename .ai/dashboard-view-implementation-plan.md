# Plan implementacji widoku Dashboard

## 1. Przegląd

Widok **Dashboard** zapewnia użytkownikowi szybki przegląd stanu nauki oraz skróty do głównych funkcji aplikacji. Łączy najważniejsze statystyki (postęp nauki, liczba fiszek, wydajność), listy (ostatnio dodane, do powtórki) oraz zestaw szybkich akcji. Układ opiera się na responsywnym grid-layoucie z komponentami reagującymi na rozmiar ekranu.

## 2. Routing widoku

```
/pages/dashboard.astro        →   GET /dashboard
```

Plik już istnieje; zostanie rozszerzony o dynamiczne komponenty React w trybie `client:visible`.

## 3. Struktura komponentów

```
DashboardPage (Astro)
 └─ <DashboardView /> (React root)
     ├─ StatsWidgets
     │   └─ StatsTile (wielokrotność)
     ├─ QuickActions
     │   └─ ActionButton (wielokrotność)
     ├─ ActivityChart (lazy-loaded)
     ├─ RecentFlashcardsList
     │   └─ FlashcardRow (wielokrotność)
     └─ DueFlashcardsList
         └─ DueCardRow (wielokrotność)
```

## 4. Szczegóły komponentów

### DashboardView

- **Opis**: Kontroler widoku. Łączy hook `useDashboardData`, zarządza stanem ładowania i błędów, renderuje grid.
- **Główne elementy**: `StatsWidgets`, `QuickActions`, `ActivityChart`, `RecentFlashcardsList`, `DueFlashcardsList`, `Toaster` (z `sonner.tsx`).
- **Obsługiwane interakcje**: brak – deleguje do komponentów potomnych.
- **Walidacja**: brak.
- **Typy**: `DashboardData` (patrz sekcja 5).
- **Propsy**: none.

### StatsWidgets

- **Opis**: Prezentuje kafelki z kluczowymi metrykami.
- **Główne elementy**: siatka `div` → `StatsTile`.
- **Obsługiwane interakcje**: tooltip on hover (Shadcn `Tooltip`).
- **Walidacja**: brak.
- **Typy**: `StatsTileVm`.
- **Propsy**: `{ tiles: StatsTileVm[] }`.

### StatsTile

- **Opis**: Pojedynczy kafelek statystyki.
- **Główne elementy**: `Card` → `CardHeader` + `CardContent`.
- **Obsługiwane interakcje**: tooltip.
- **Walidacja**: brak.
- **Typy**: `StatsTileVm`.
- **Propsy**: `StatsTileVm` (spread).

### QuickActions

- **Opis**: Przyciski skrótów do głównych akcji (generuj, dodaj ręcznie, rozpocznij powtórkę).
- **Główne elementy**: flex box z `ActionButton`.
- **Obsługiwane interakcje**: klik ⇒ nawigacja (router lub `<a>`).
- **Walidacja**: brak.
- **Typy**: `ActionVm`.
- **Propsy**: `{ actions: ActionVm[] }`.

### ActionButton

- **Opis**: Stylizowany przycisk z ikoną.
- **Główne elementy**: `Button` (Shadcn) + `Icon`.
- **Obsługiwane interakcje**: click, focus (klawisz `Tab`).
- **Walidacja**: brak.
- **Typy**: `ActionVm`.
- **Propsy**: `ActionVm`.

### ActivityChart

- **Opis**: Wizualizacja aktywności (wykres słupkowy liczby recenzji per dzień ostatnich 14 dni).
- **Główne elementy**: `Card` + dynamicznie załadowany komponent chartu wykorzystujący shadcn/UI Chart (`ChartContainer`, komponenty Recharts).
- **Obsługiwane interakcje**: hover tooltip na słupkach.
- **Walidacja**: brak.
- **Typy**: `ActivityPoint`.
- **Propsy**: `{ data: ActivityPoint[] }`.

### RecentFlashcardsList

- **Opis**: Lista 5 ostatnio dodanych fiszek.
- **Główne elementy**: tabela (Shadcn `Table`) → `FlashcardRow`.
- **Obsługiwane interakcje**: click na wiersz ⇒ przejście do widoku listy z filtrem „ostatnio utworzone”.
- **Walidacja**: brak.
- **Typy**: `FlashcardListItemDto`.
- **Propsy**: `{ items: FlashcardListItemDto[] }`.

### DueFlashcardsList

- **Opis**: Lista fiszek zaplanowanych do powtórki na dziś (max 5).
- **Główne elementy**: tabela → `DueCardRow`.
- **Obsługiwane interakcje**: click ⇒ przejście do `/reviews`.
- **Walidacja**: brak.
- **Typy**: `ReviewCardDto`.
- **Propsy**: `{ items: ReviewCardDto[] }`.

## 5. Typy

```
interface StatsTileVm {
  label: string;        // np. "Łącznie fiszek"
  value: number | string;
  tooltip?: string;
}

interface ActionVm {
  label: string;        // "Generuj AI"
  icon: React.ReactNode;
  href: string;         // docelowa ścieżka
}

interface ActivityPoint {
  date: string;         // ISO YYYY-MM-DD
  reviews: number;      // liczba recenzji w dniu
}

interface DashboardData {
  totalFlashcards: number;
  stats: PerformanceStatsDto;
  tagStats: TagStatisticDto[];
  recent: FlashcardListItemDto[];
  due: ReviewCardDto[];
  activity: ActivityPoint[];
}
```

## 6. Zarządzanie stanem

- Stworzyć hook `useDashboardData`:
  - Wykonuje wszystkie wywołania API równolegle (`Promise.all`).
  - Zapewnia pola `{ data?: DashboardData, loading: boolean, error?: string, reload() }`.
  - Łączy token Supabase z `Authorization` nagłówkiem.
  - Wykorzystuje `useEffect` + `AbortController` do anulowania requestów przy unmount.
- Lokalny stan sortowania/filtrów nie jest wymagany (lista zawiera stałe 5 pozycji).

## 7. Integracja API

| Cel                     | Metoda | Ścieżka                                           | Odpowiedź                                   | Użycie       |
| ----------------------- | ------ | ------------------------------------------------- | ------------------------------------------- | ------------ |
| Liczba fiszek           | GET    | /flashcards?page=1&pageSize=1                     | `FlashcardListResponseDto.pagination.total` | odczyt total |
| Lista ostatnich         | GET    | /flashcards?page=1&pageSize=5&sort=created_desc\* | `FlashcardListResponseDto.items`            | recent       |
| Statystyki wydajności   | GET    | /stats/performance                                | `PerformanceStatsDto`                       | stats        |
| Statystyki tagów        | GET    | /stats/tags                                       | `TagStatisticDto[]`                         | tagStats     |
| Fiszki do powtórki      | GET    | /reviews/session                                  | `ReviewSessionResponseDto`                  | due          |
| Aktywność (opcjonalnie) | GET    | /reviews/session?history=14\*                     | własny endpoint w przyszłości / placeholder | activity     |

\* parametry sort/historia – do ustalenia; jeżeli backend ich nie wspiera, tymczasowo pomijamy.

## 8. Interakcje użytkownika

1. Klik „Generuj AI” → nawigacja do `/flashcards/generate`.
2. Klik „Dodaj fiszkę” → otwarcie modala tworzenia (lub `/flashcards#index` z presetem).
3. Klik „Rozpocznij powtórkę” lub wiersz `DueFlashcardsList` → nawigacja do `/reviews`.
4. Klik wiersza `RecentFlashcardsList` → przejście do `/flashcards#index` z anchor `#recent`.
5. Focus/hover kafelka statystyki → wyświetlenie tooltipa.

## 9. Warunki i walidacja

- Brak walidacji formularzowych; dane pochodzą z API.
- Walidacja statusu HTTP:
  - `401` ⇒ redirect do `/login`.
  - `204` przy `/reviews/session` ⇒ komponent `DueFlashcardsList` wyświetla placeholder „Brak fiszek do powtórki”.

## 10. Obsługa błędów

- Centralna obsługa w `useDashboardData`:
  - Nieudane żądanie ⇒ zapis błędu w `error`, wyświetlenie toast (`sonner`) + komponent Fallback z przyciskiem „Ponów próbę”.
- Komponenty dzieci pokazują `<Skeleton>` do czasu wczytania.
- Przy częściowym błędzie (np. brak aktywności) renderujemy placeholder zamiast całkowitego fail-state.

## 11. Kroki implementacji

1. **Typy**: dodać plik `src/types/dashboard.ts` z definicjami `StatsTileVm`, `ActionVm`, `ActivityPoint`, `DashboardData`.
2. **Hook**: zaimplementować `src/hooks/useDashboardData.ts` zgodnie z sekcją 6.
3. **Komponenty kafelków**: `StatsTile` + `StatsWidgets` (Shadcn `Card`, `Tooltip`).
4. **QuickActions**: utworzyć `ActionButton` oraz kontener `QuickActions`.
5. **ActivityChart**: zainstalować chart z shadcn (`pnpm dlx shadcn@latest add chart`); zaimplementować `ActivityChart.tsx` z użyciem `ChartContainer`, `BarChart`, `CartesianGrid`, `XAxis`, `ChartTooltip`, `ChartLegend` i innych komponentów z shadcn/UI; ładować dynamicznie `import("./ActivityChart")` w `client:visible`.
6. **Listy**: zaadaptować istniejące komponenty tabeli (`FlashcardTable`) lub stworzyć lekkie `RecentFlashcardsList`, `DueFlashcardsList`.
7. **DashboardView**: skomponować powyższe, podłączyć hook, zorganizować layout Tailwind grid `md:grid-cols-2 lg:grid-cols-4`.
8. **Astro**: w `dashboard.astro` wstawić `<DashboardView client:visible />`, usunąć placeholder `<h1>`.
9. **Skeletony**: wykorzystać Shadcn `Skeleton` w kafelkach, listach, wykresie.
10. **Toasty**: upewnić się, że globalny provider `Sonner` jest załadowany (np. w `Layout.astro`).
11. **Testy**:
    - Jednostkowe: hook (`vitest` + msw), render komponentów (`@testing-library/react`).
    - E2E (Playwright): scenariusz „Dashboard displays stats and lists”.
12. **Accessibility**: dodać `aria-label` do przycisków, elementów focusowalnych; test klawiaturą.
13. **CI**: zaktualizować snapshoty testów i ESLint.
14. **Dokumentacja**: dopisać sekcję w `README.md` – jak działa Dashboard.
