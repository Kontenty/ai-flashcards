# API Endpoint Implementation Plan: **GET /api/stats/performance**

## 1. Przegląd punktu końcowego

Punkt końcowy zwraca skonsolidowane statystyki skuteczności użytkownika w systemie powtórek SM-2.

- Zwracane metryki:
  - `totalReviews` – łączna liczba powtórek wykonanych przez użytkownika.
  - `correctPercentage` – odsetek powtórek ocenionych jako poprawne (`quality` ≥ 3).
  - `dailyStats` – (opcjonalnie) zestawienie dzienne dla bieżącego tygodnia.
- Dane pobierane są w całości z bazy danych Supabase przy użyciu:
  - widoku `daily_review_stats` (dzienne zestawienie),
  - widoku `get_performance_stats` (agregaty globalne).

## 2. Szczegóły żądania

- **Metoda HTTP**: `GET`
- **Ścieżka**: `/api/stats/performance`
- **Query params**:
  - `include` _(string, opcjonalny)_ – lista pól do zwrócenia; obsługiwane wartości:
    - `daily_stats` – dołącza szczegółowe statystyki dzienne.
    - Domyślnie zwracane są tylko `total_reviews` i `correct_percentage`.
- **Ciało żądania**: brak
- **Nagłówki**: `Authorization: Bearer <JWT>` (wymagany)

## 3. Wykorzystywane typy

- `PerformanceStatsDto` – z `src/types/types.dto.ts`
- Schemat walidacji query-params (Zod):
  ```ts
  // src/lib/validators/stats.schema.ts
  import { z } from "zod";
  export const performanceQuerySchema = z.object({
    include: z
      .string()
      .optional()
      .transform((val) => val?.split(",") ?? [])
      .refine((list) => list.every((x) => ["daily_stats"].includes(x)), {
        message: "Invalid include value",
      }),
  });
  ```

## 4. Szczegóły odpowiedzi

| Kod | Kiedy                                        | Body                                   |
| --- | -------------------------------------------- | -------------------------------------- |
| 200 | Żądanie poprawne, użytkownik uwierzytelniony | `PerformanceStatsDto`                  |
| 401 | Brak/niepoprawny JWT                         | `{ message: "Unauthorized" }`          |
| 500 | Błąd serwera / DB                            | `{ message: "Internal server error" }` |

Przykład **200 OK** (z `daily_stats`):

```json
{
  "total_reviews": 250,
  "correct_percentage": 88.5,
  "daily_stats": [
    {
      "review_date": "2025-06-16",
      "cards_reviewed": 15,
      "mean_quality": 4.25
    }
  ]
}
```

## 5. Przepływ danych

1. Middleware uwierzytelniające w `src/middleware/index.ts` ustawia `locals.user` oraz `locals.supabase`.
2. Handler `pages/api/stats/performance.ts`:
   1. Waliduje `include` przy pomocy `performanceQuerySchema`.
   2. Tworzy instancję `StatsService` (`createStatsService`).
   3. Wywołuje `statsService.getPerformanceStats(user.id, { includeDaily })`.
3. `StatsService`:
   1. Równolegle:
      - `supabase.from('get_performance_stats').select('total_reviews,correct_percentage')` → agregaty globalne.
      - (jeśli `includeDaily`) `supabase.from('daily_review_stats').select()` → dzienne dane.
   2. Mapuje surowe wyniki na `PerformanceStatsDto`.
4. Handler buduje odpowiedź JSON i zwraca `200`.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie** – wymagany JWT; brak JWT → `401`.
- **Autoryzacja** – RLS w widoku oraz w funkcji SQL ogranicza dane do `auth.uid()`.
- **Walidacja danych** – Zod zabezpiecza przed nieprawidłowymi parametrami zapytania.
- **Brak wstrzyknięć SQL** – użycie supabase-js i RPC.
- **Rate limiting** – opcjonalnie zaimplementować w middleware (np. 60 req/min).
- **Dostęp do widoku** – `GRANT SELECT ON get_performance_stats TO authenticated` zapewnia dostęp tylko dla uwierzytelnionych użytkowników.

## 7. Obsługa błędów

| Scenariusz                 | Działanie                                                                      | Logowanie                            |
| -------------------------- | ------------------------------------------------------------------------------ | ------------------------------------ |
| Nieprawidłowe query-params | `400 Bad Request` (future-proof, choć obecnie jedyna wartość to `daily_stats`) | `logService.warn()`                  |
| Brak sesji użytkownika     | `401 Unauthorized`                                                             | brak (typowy przypadek)              |
| Błąd RPC / bazy            | `500 Internal Server Error`                                                    | `logService.error()` z treścią błędu |
| Timeout Supabase           | `503 Service Unavailable` _(opcjonalnie)_                                      | `logService.error()`                 |

## 8. Rozważania dotyczące wydajności

- Zapytania o agregaty i dzienne statystyki wykonywane są **równolegle** (`Promise.all`).
- Widok `daily_review_stats` jest ograniczony do bieżącego tygodnia i ma indeks na `review_date`; zapytanie jest szybkie.
- Funkcja RPC zwraca pojedynczy wiersz – minimalny payload.
- Endpoint jest **read-only** – może być cachowany na np. 3 minuty (HTTP `Cache-Control` z `private, max-age=180`).

## 9. Kroki implementacji

1. **Typy & schematy**
   - Upewnij się, że `PerformanceStatsDto` eksportuje pola w camelCase; dodaj do `src/types/index.ts` alias barrel.
   - Dodaj `performanceQuerySchema` w `src/lib/validators/stats.schema.ts`.
2. **StatsService** (`src/lib/services/stats.service.ts`)

   ```ts
   import type { SupabaseClient } from "@supabase/supabase-js";
   import { err, ok, type Result } from "@/lib/utils/result";
   import type { PerformanceStatsDto } from "@/types";

   export const createStatsService = (db: SupabaseClient) => {
     const getPerformanceStats = async (
       userId: string,
       opts: { includeDaily?: boolean } = {},
     ): Promise<Result<PerformanceStatsDto, string>> => {
       try {
         const aggPromise = db
           .from("get_performance_stats")
           .select("total_reviews,correct_percentage");
         const dailyPromise = opts.includeDaily
           ? db.from("daily_review_stats").select("review_date,cards_reviewed,mean_quality")
           : Promise.resolve({ data: null });

         const [aggRes, dailyRes] = await Promise.all([aggPromise, dailyPromise]);
         if (aggRes.error) return err(aggRes.error.message);
         if (dailyRes && "error" in dailyRes && dailyRes.error) return err(dailyRes.error.message);

         const { total_reviews, correct_percentage } = aggRes.data[0] || {
           total_reviews: 0,
           correct_percentage: 0,
         };

         return ok({
           totalReviews: total_reviews ?? 0,
           correctPercentage: Number(correct_percentage ?? 0),
           dailyStats: opts.includeDaily
             ? (dailyRes.data ?? []).map((r) => ({
                 reviewDate: r.review_date,
                 cardsReviewed: r.cards_reviewed,
                 meanQuality: Number(r.mean_quality),
               }))
             : undefined,
         });
       } catch (e) {
         return err(e instanceof Error ? e.message : String(e));
       }
     };

     return { getPerformanceStats };
   };
   ```

3. **Endpoint handler** (`src/pages/api/stats/performance.ts`)
   1. Parse & validate query params.
   2. Early-return `401` gdy brak `locals.user`.
   3. Wywołaj `statsService.getPerformanceStats(user.id, { includeDaily })`.
   4. Mapuj `result.isError` → `500`; w sukcesie zwróć JSON + `200`.
4. **Testy**
   - **Unit** – `tests/unit/services/stats.service.test.ts` (mock supabase, success & error cases).
   - **E2E** – `tests/e2e/stats.spec.ts` już istnieją; zaktualizuj asercje dla `include=daily_stats`.
5. **Dokumentacja** – uaktualnij OpenAPI / README.
6. **Code review & merge** – sprawdź linters, formatter, testy.
