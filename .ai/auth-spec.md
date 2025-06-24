# Specyfikacja Techniczna: Moduł Autentykacji Użytkowników

## 1. Wprowadzenie

Niniejszy dokument opisuje architekturę i implementację modułu autentykacji (rejestracja, logowanie, wylogowywanie, odzyskiwanie hasła) dla aplikacji 10xFlashCards. Specyfikacja bazuje na wymaganiach z pliku `prd.md` oraz na zdefiniowanym stosie technologicznym (`tech-stack.md`), wykorzystując Astro, React i Supabase Auth.

Celem jest stworzenie bezpiecznego, wydajnego i skalowalnego rozwiązania, które integruje się z istniejącą strukturą aplikacji.

## 2. Architektura Interfejsu Użytkownika (UI)

### 2.1. Nowe Strony (Astro)

W celu obsługi procesów autentykacji, utworzone zostaną następujące strony w katalogu `src/pages/`:

- **`src/pages/login.astro`**: Strona logowania. Będzie zawierać komponent `LoginForm` i podstawową strukturę wizualną.
- **`src/pages/register.astro`**: Strona rejestracji. Będzie osadzać komponent `RegisterForm`.
- **`src/pages/forgot-password.astro`**: Strona do inicjowania procesu odzyskiwania hasła.
- **`src/pages/reset-password.astro`**: Strona, na którą użytkownik zostanie przekierowany z maila w celu ustawienia nowego hasła. Będzie ona odczytywać token resetu z parametrów URL.
- **`src/pages/dashboard.astro`**: Nowy "pulpit użytkownika", który będzie chroniony i dostępny tylko dla zalogowanych użytkowników. Może to być refaktoryzacja istniejącej strony głównej z listą fiszek.

### 2.2. Nowe Komponenty (React)

Interaktywne elementy formularzy zostaną zaimplementowane jako komponenty React w `src/components/auth/`:

- **`LoginForm.tsx`**: Komponent kliencki (`"use client"`) zawierający formularz z polami "Email" i "Hasło". Będzie on odpowiedzialny za:

  - Walidację po stronie klienta (np. przy użyciu `zod` i `react-hook-form`).
  - Komunikację z endpointem API (`/api/auth/login`) w celu zalogowania użytkownika.
  - Wyświetlanie komunikatów o błędach (np. "Nieprawidłowe dane logowania").
  - Przekierowanie użytkownika do `/dashboard` po pomyślnym zalogowaniu.

- **`RegisterForm.tsx`**: Komponent kliencki z formularzem zawierającym pola "Email", "Hasło", "Powtórz hasło" oraz **wymagany checkbox RODO** (zgodnie z `US-001`). Odpowiedzialności:

  - Walidacja (format email, siła hasła >= 8 znaków, zgodność haseł).
  - Wywołanie endpointu `/api/auth/register`.
  - Obsługa stanu ładowania i błędów.
  - Informowanie użytkownika o konieczności potwierdzenia adresu e-mail.

- **`UserNav.tsx`**: Komponent wyświetlany w głównym layoucie.
  - **Dla gości**: Wyświetli linki "Zaloguj się" i "Zarejestruj się".
  - **Dla zalogowanych**: Wyświetli awatar użytkownika i menu (dropdown) z opcjami "Dashboard", "Ustawienia" i "Wyloguj".

### 2.3. Modyfikacja Layoutu

- **`src/layouts/Layout.astro`**: Główny layout aplikacji zostanie zmodyfikowany, aby zarządzać stanem widoczności w zależności od autentykacji.
  - W części `<head>` lub na końcu `<body>` umieszczony zostanie skrypt Supabase do obsługi sesji po stronie klienta.
  - W ciele strony, w sekcji nawigacji, `Layout.astro` będzie pobierał informacje o sesji użytkownika z `Astro.locals` (dostarczone przez middleware).
  - Na podstawie istnienia sesji, warunkowo renderowany będzie komponent `UserNav.tsx` (w trybie dla gościa lub zalogowanego użytkownika).

### 2.4. Scenariusze i Walidacja

- **Walidacja formularzy**: Biblioteka `zod` posłuży do zdefiniowania schematów walidacji dla każdego formularza, co zapewni spójność między frontendem a backendem. Integracja z `react-hook-form` ułatwi zarządzanie stanem i błędami.
- **Komunikaty**: Błędy walidacji będą wyświetlane pod odpowiednimi polami. Globalne błędy (np. błąd serwera) będą pokazywane za pomocą komponentu `Alert` z `shadcn/ui`.
- **Nawigacja**: Po udanej rejestracji/logowaniu, użytkownik jest przekierowywany na stronę `/dashboard` przy użyciu `window.location.href` lub `Astro.redirect` po stronie serwera.

## 3. Logika Backendowa

Backend zostanie zrealizowany przy użyciu API Routes w Astro oraz middleware do ochrony stron.

### 3.1. Konfiguracja Astro

Należy zaktualizować plik `astro.config.mjs`, aby włączyć tryb renderowania po stronie serwera, co jest kluczowe dla bezpiecznej obsługi sesji.

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  output: "server", // lub 'hybrid'
  integrations: [react(), tailwind()],
  // ...
});
```

Należy również zainstalować oficjalną integrację Tailwind: `npx astro add tailwind`.

### 3.2. Endpointy API (Astro API Routes)

W katalogu `src/pages/api/auth/` powstaną następujące endpointy:

- **`login.ts` (`POST`)**:

  - Odbiera `email` i `password`.
  - Waliduje dane wejściowe przy użyciu schemy `zod`.
  - Wywołuje `supabase.auth.signInWithPassword()`.
  - W przypadku sukcesu, `auth-helpers-astro` automatycznie ustawi odpowiednie ciasteczka sesyjne.
  - Zwraca status 200 OK lub 401/500 w przypadku błędu.

- **`register.ts` (`POST`)**:

  - Odbiera `email` i `password`.
  - Waliduje dane i sprawdza, czy checkbox RODO został zaznaczony (przesłany w ciele żądania).
  - Wywołuje `supabase.auth.signUp()`. Supabase domyślnie wyśle e-mail z linkiem potwierdzającym.
  - Zwraca status 201 Created lub 400/500.

- **`logout.ts` (`POST`)**:

  - Wywołuje `supabase.auth.signOut()`.
  - Helper czyści ciasteczka sesyjne.
  - Zwraca status 200 OK.

- **`callback.ts` (`GET`)**:
  - Endpoint wymagany przez Supabase do obsługi przekierowań po zalogowaniu przez OAuth lub po kliknięciu w link weryfikacyjny/resetujący hasło.
  - Wymienia kod autoryzacyjny na sesję użytkownika.
  - Przekierowuje użytkownika na `/dashboard`.

### 3.3. Middleware

Utworzony zostanie plik `src/middleware/index.ts`, który będzie wykonywany przed każdym żądaniem.

- **Zadania middleware**:
  1.  Dla każdej strony tworzy klienta Supabase w kontekście żądania.
  2.  Sprawdza, czy użytkownik próbuje uzyskać dostęp do chronionej ścieżki (np. `/dashboard/*`).
  3.  Jeśli tak, weryfikuje istnienie i ważność sesji (ciasteczka).
  4.  Jeśli sesja jest nieprawidłowa, przekierowuje użytkownika na stronę logowania (`/login`).
  5.  Jeśli sesja jest ważna, umieszcza dane sesji i użytkownika w `Astro.locals`, aby były dostępne w komponentach Astro po stronie serwera.

## 4. System Autentykacji (Supabase Auth)

### 4.1. Integracja z Astro

Zalecane jest użycie oficjalnego pakietu `@supabase/auth-helpers-astro`, który upraszcza zarządzanie sesją i uwierzytelnianie po stronie serwera poprzez mechanizm ciasteczek.

- **Instalacja**: `pnpm add @supabase/supabase-js @supabase/auth-helpers-astro`
- **Konfiguracja**: Klient Supabase będzie tworzony z użyciem `createSupabaseClient` z pakietu pomocniczego, co zapewni prawidłową obsługę sesji w kontekście pojedynczego żądania HTTP. Zmienne środowiskowe (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) muszą być skonfigurowane w pliku `.env`.

### 4.2. Procesy Autentykacji

- **Rejestracja**: `supabase.auth.signUp()` z opcją `emailRedirectTo`, która wskaże na stronę główną aplikacji. Domyślnie włączona jest weryfikacja e-mail.
- **Logowanie**: `supabase.auth.signInWithPassword()`.
- **Odzyskiwanie hasła**:
  1.  Użytkownik na stronie `/forgot-password` podaje e-mail.
  2.  Frontend wywołuje `supabase.auth.resetPasswordForEmail()` z `redirectTo` wskazującym na `/reset-password`.
  3.  Użytkownik otrzymuje e-mail z linkiem.
  4.  Na stronie `/reset-password` frontend odczytuje token i po podaniu nowego hasła wywołuje `supabase.auth.updateUser()`.
- **Zarządzanie sesją**: Sesja jest przechowywana w bezpiecznych, serwerowych ciasteczkach (HttpOnly), a helpery Supabase zajmują się ich odświeżaniem i walidacją.

### 4.3. Bezpieczeństwo

- **Row Level Security (RLS)**: Po dodaniu autentykacji, dla tabel `flashcards` i `tags` w Supabase należy włączyć i skonfigurować RLS. Reguły powinny zapewniać, że użytkownik ma dostęp (SELECT, INSERT, UPDATE, DELETE) wyłącznie do własnych zasobów, na podstawie `auth.uid() = user_id`.
- **Ochrona API**: Wszystkie endpointy API modyfikujące dane (np. `POST /api/flashcards`) muszą być chronione przez middleware, aby upewnić się, że żądanie pochodzi od zalogowanego użytkownika.
