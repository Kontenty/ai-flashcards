# Przewodnik implementacji usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter jest warstwą pośrednią umożliwiającą komunikację z API OpenRouter w celu generowania odpowiedzi LLM (Large Language Model) na potrzeby czatów i innych funkcji AI. Zapewnia obsługę komunikatów systemowych, użytkownika, response_format (w tym JSON Schema), wyboru modelu oraz parametrów modelu. Usługa dba o bezpieczeństwo, obsługę błędów i zgodność z wymaganiami stacku (Astro 5, TypeScript 5, React 19, Supabase, Shadcn/ui).

## 2. Opis konstruktora

Konstruktor przyjmuje:

- `apiKey: string` – klucz API OpenRouter (przechowywany bezpiecznie, np. w zmiennych środowiskowych)
- `baseUrl?: string` – opcjonalny URL endpointu (domyślnie https://openrouter.ai/api/v1)
- `defaultModel?: string` – domyślny model LLM
- `defaultParams?: Record<string, unknown>` – domyślne parametry modelu

Przykład:

```ts
const openRouterService = new OpenRouterService({
  apiKey: process.env.OPEN_ROUTER_API_KEY!,
  defaultModel: "gpt-4",
  defaultParams: { temperature: 0.7 },
});
```

## 3. Publiczne metody i pola

- `sendChat(messages: OpenRouterMessage[], options?: SendChatOptions): Promise<OpenRouterResponse>`
  - Wysyła czat do OpenRouter API z obsługą system/user message, response_format, modelu i parametrów.
- `setDefaultModel(model: string): void`
- `setDefaultParams(params: Record<string, unknown>): void`

### Typy:

- `OpenRouterMessage` – { role: 'system' | 'user' | 'assistant', content: string }
- `SendChatOptions` – { model?: string, params?: Record<string, unknown>, responseFormat?: ResponseFormat }
- `ResponseFormat` – { type: 'json_schema', json_schema: { name: string, strict: boolean, schema: object } }
- `OpenRouterResponse` – odpowiedź modelu (raw lub zparsowana wg response_format)

## 4. Prywatne metody i pola

- `_buildPayload(messages, options)` – buduje payload zgodny z OpenRouter API
- `_handleResponse(response)` – przetwarza odpowiedź, waliduje wg response_format
- `_handleError(error)` – centralna obsługa błędów i logowanie
- Prywatne pola: `_apiKey`, `_baseUrl`, `_defaultModel`, `_defaultParams`

## 5. Obsługa błędów

Potencjalne scenariusze:

1. Brak/nieprawidłowy klucz API
2. Błąd sieciowy lub timeout
3. Błąd walidacji response_format
4. Błąd modelu (np. nieobsługiwany model, złe parametry)
5. Przekroczenie limitów (rate limit)
6. Błąd nieznany

Każdy scenariusz powinien:

- Zwracać czytelny komunikat i kod błędu (np. `OpenRouterServiceError` z kodem)
- Logować błąd (np. do logService)
- W przypadku błędów walidacji – zwracać szczegóły niezgodności

## 6. Kwestie bezpieczeństwa

- Klucz API przechowywać w zmiennych środowiskowych (nigdy w kodzie źródłowym)
- Walidować i sanityzować wszystkie wejścia (np. komunikaty użytkownika)
- Ograniczać uprawnienia i dostęp do endpointu OpenRouter
- Stosować limity i timeouty na żądania
- Logować tylko niezbędne dane (bez wrażliwych informacji)

## 7. Plan wdrożenia krok po kroku

1. **Stwórz plik `src/lib/services/openrouter.service.ts`**
   - Zaimplementuj klasę `OpenRouterService` zgodnie z powyższą specyfikacją.
2. **Dodaj obsługę komunikatów systemowych i użytkownika**
   - Przykład:
     ```ts
     const messages = [
       { role: "system", content: "Jesteś pomocnym asystentem." },
       { role: "user", content: "Wytłumacz zasadę działania OpenRouter." },
     ];
     ```
3. **Obsłuż response_format (JSON Schema)**
   - Przykład:
     ```ts
     const responseFormat = {
       type: "json_schema",
       json_schema: {
         name: "flashcard_response",
         strict: true,
         schema: {
           type: "object",
           properties: {
             front: { type: "string" },
             back: { type: "string" },
           },
           required: ["front", "back"],
         },
       },
     };
     ```
   - Przekaż jako opcję do `sendChat`.
4. **Obsłuż wybór modelu i parametrów**
   - Przykład:
     ```ts
     openRouterService.sendChat(messages, {
       model: "gpt-4",
       params: { temperature: 0.5, max_tokens: 256 },
     });
     ```
5. **Zaimplementuj obsługę błędów**
   - Rzucaj i loguj błędy z czytelnym kodem i komunikatem.
   - Przykład:
     ```ts
     try {
       await openRouterService.sendChat(messages);
     } catch (e) {
       if (e instanceof OpenRouterServiceError) {
         // obsłuż błąd specyficzny dla OpenRouter
       }
     }
     ```
6. **Zintegruj z istniejącą logiką (np. AiService)**
   - Zastąp placeholdery w `AiService` wywołaniami do `OpenRouterService`.
7. **Przetestuj wszystkie scenariusze (poprawne, błędne, edge cases)**
   - Testy jednostkowe i integracyjne.
8. **Zadbaj o bezpieczeństwo**
   - Sprawdź, czy klucz API nie wycieka do klienta.
   - Waliduj wejścia i odpowiedzi.
9. **Dokumentuj publiczne metody i typy**
   - Użyj JSDoc/TypeScript dla lepszej czytelności i autouzupełniania.

---

**Przykłady użycia:**

- Komunikat systemowy:
  ```ts
  { role: 'system', content: 'Jesteś ekspertem od AI.' }
  ```
- Komunikat użytkownika:
  ```ts
  { role: 'user', content: 'Wyjaśnij, czym jest LLM.' }
  ```
- response_format (JSON Schema):
  ```ts
  {
    type: 'json_schema',
    json_schema: {
      name: 'flashcard_response',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          front: { type: 'string' },
          back: { type: 'string' },
        },
        required: ['front', 'back'],
      },
    },
  }
  ```
- Nazwa modelu:
  ```ts
  model: "gpt-4";
  ```
- Parametry modelu:
  ```ts
  params: { temperature: 0.7, max_tokens: 512 }
  ```
