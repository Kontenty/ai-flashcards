# Dokument wymagań produktu (PRD) - 10xFlashCards

## 1. Przegląd produktu

Aplikacja 10xFlashCards ma na celu usprawnienie i przyspieszenie procesu tworzenia wysokiej jakości fiszek edukacyjnych poprzez automatyzację generowania treści, przy jednoczesnej możliwości ręcznej edycji i zarządzania. Wersja MVP oferuje generowanie fiszek przez AI na podstawie wklejonego tekstu, ręczne tworzenie, przeglądanie, edycję i usuwanie fiszek, prosty system kont użytkowników z akceptacją RODO, przechowywanie tagów i statystyk oraz integrację z algorytmem SM-2 do powtórek.

## 2. Problem użytkownika

Manualne tworzenie fiszek jest czasochłonne i wymaga od użytkownika ręcznego formułowania pytań i odpowiedzi, co obniża chęć korzystania z efektywnej metody nauki metodą spaced repetition.

## 3. Wymagania funkcjonalne

- Generowanie fiszek przez AI na podstawie wklejonego tekstu (do 5000 znaków wejściowych).
  - ograniczenie: front ≤200 znaków, back ≤500 znaków
- Ręczne tworzenie fiszek z polami "front" i "back" o określonych limitach
- Przeglądanie, edycja i usuwanie istniejących fiszek
- Wygenerowane przez AI fiszki są przedstawiane użytkownikowi w formie listy z możliwością akceptacji, edycji lub odrzucenia
- System rejestracji i logowania użytkowników z obowiązkowym zaakceptowaniem klauzuli RODO
- Przechowywanie dodatkowych danych: tagów oraz statystyk użytkownika
- Sesje powtórek realizowane według algorytmu SM-2

## 4. Granice produktu

- Brak własnego zaawansowanego algorytmu powtórek (np. SuperMemo, Anki)
- Brak importu plików PDF, DOCX i innych formatów
- Brak możliwości współdzielenia zestawów fiszek między użytkownikami
- Brak integracji z zewnętrznymi platformami edukacyjnymi
- Brak natywnych aplikacji mobilnych (tylko wersja web)
- Brak osobnej analizy ryzyka i dodatkowych procedur zabezpieczeń poza RODO

## 5. Historyjki użytkowników

- ID: US-001
  Tytuł: Rejestracja i logowanie
  Opis: jako nowy użytkownik chcę założyć konto i zalogować się, aby mieć bezpieczny dostęp do moich fiszek
  Kryteria akceptacji:

  - formularz rejestracji zawiera pola email, hasło i checkbox RODO
  - walidacja formatu email oraz minimalnej długości hasła (>=8 znaków)
  - po poprawnym wypełnieniu następuje przekierowanie do pulpitu użytkownika
  - użytkownik może się wylogować przyciskiem "wyloguj"

- ID: US-002
  Tytuł: Generowanie fiszek AI na podstawie tekstu
  Opis: jako użytkownik chcę wkleić tekst (maksymalnie 5000 znaków) i wygenerować propozycje fiszek AI z limitami front ≤200 i back ≤500 znaków
  Kryteria akceptacji:

  - pole tekstowe przyjmuje do 5000 znaków, przekroczenie limitu wyświetla komunikat o błędzie
  - po kliknięciu przycisku generuj wywoływane jest API AI, a na ekranie pojawia się lista fiszek
  - w przypadku błędu serwera lub sieci wyświetlany jest komunikat o niepowodzeniu operacji

- ID: US-003
  Tytuł: Akceptacja i edycja wygenerowanych fiszek
  Opis: jako użytkownik chcę zatwierdzać lub edytować indywidualne fiszki AI przed ich zapisaniem
  Kryteria akceptacji:

  - przy każdej fiszce znajduje się przycisk "akceptuj" zapisujący ją bez zmian
  - przycisk "edytuj" otwiera modal z polami front/back oraz walidacją limitów
  - po wprowadzeniu zmian i zatwierdzeniu zapisywane są nowe wartości fiszki
  - opcja anulowania zamyka modal bez zapisu zmian
  - użytkownik może zatwierdzić pojedynczo lub wszystkie fiszki z listy

- ID: US-004
  Tytuł: Ręczne tworzenie fiszek
  Opis: jako użytkownik chcę ręcznie dodawać fiszki, aby mieć pełną kontrolę nad treścią
  Kryteria akceptacji:

  - formularz dodawania zawiera pola front (wymagane, ≤200 znaków), back (wymagane, ≤500 znaków) i tagi opcjonalne
  - walidacja obecności danych i limitów znaków
  - kliknięcie "zapisz" dodaje fiszkę do listy i wyświetla ją natychmiast

- ID: US-005
  Tytuł: Przeglądanie i zarządzanie fiszkami
  Opis: jako użytkownik chcę przeglądać, filtrować, edytować i usuwać moje fiszki
  Kryteria akceptacji:

  - lista wyświetla front, back, przypisane tagi i datę utworzenia fiszki
  - możliwość filtrowania listy po wybranych tagach
  - przycisk "edytuj" otwiera formularz edycji z walidacją limitów
  - przycisk "usuń" wyświetla potwierdzenie; potwierdzenie usuwa fiszkę

- ID: US-006
  Tytuł: Zarządzanie tagami i statystykami
  Opis: jako użytkownik chcę dodawać tagi do fiszek i przeglądać statystyki użycia, aby lepiej organizować naukę
  Kryteria akceptacji:

  - możliwość tworzenia, edytowania i usuwania własnych tagów
  - przypisywanie tagów podczas tworzenia lub edycji fiszki
  - widok statystyk pokazuje liczbę fiszek per tag oraz procent poprawnych powtórek

- ID: US-007
  Tytuł: Powtórki według algorytmu SM-2
  Opis: jako użytkownik chcę przeprowadzać powtórki według algorytmu SM-2, by optymalizować harmonogram nauki
  Kryteria akceptacji:
  - sesja powtórek pobiera fiszki według oceny SM-2
  - po pokazaniu front użytkownik ocenia przypomnienie w skali 0-5
  - algorytm aktualizuje datę kolejnej powtórki i zapisuje wynik w statystykach
  - jeśli brak fiszek do powtórek, wyświetlany jest komunikat "Brak fiszek do powtórek"

## 6. Metryki sukcesu

- 75% fiszek wygenerowanych przez AI zaakceptowanych przez użytkowników
- 75% wszystkich fiszek tworzonych z wykorzystaniem AI
- liczba aktywnych użytkowników miesięcznie
- średni czas generowania fiszek AI
- średni udział AI w procesie tworzenia fiszek dziennie
