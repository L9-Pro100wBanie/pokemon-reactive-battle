# Projekt Zaliczeniowy - Programowanie Reaktywne ⚔️

Aplikacja webowa typu "Pokemon Battle", stworzona jako projekt zaliczeniowy z przedmiotu Programowanie Reaktywne. Projekt demonstruje wykorzystanie biblioteki React do budowy interfejsu oraz RxJS do asynchronicznego zarządzania zdarzeniami i przepływem danych.

## 🚀 

* **React:** Podział na komponenty, zarządzanie stanem (`useState`, `useEffect`), routing (`react-router-dom`).
* **RxJS (Kluczowy element):**
    * `debounceTime`, `distinctUntilChanged`, `switchMap` – wykorzystane w reaktywnej wyszukiwarce Pokemonów, zapobiegające nadmiarowym zapytaniom i problemom typu *race conditions*.
    * `exhaustMap` – wykorzystany w silniku walki, aby zablokować możliwość "spamowania" przycisku ataku w trakcie trwania tury i odtwarzania animacji.
* **JavaScript i DOM:** Walidacja formularza, obsługa zdarzeń, wykorzystanie `localStorage` do zapisu sesji użytkownika, wybranej drużyny oraz poziomu trudności.
* **Pobieranie i prezentacja danych:** Asynchroniczne filtrowanie i mapowanie bazy danych w pliku JSON, generowanie graficznego interfejsu (karty, paski HP).
* **CSS i UI:** Responsywny layout, animacje ataków i otrzymywania obrażeń, dynamiczne tła zależne od typu Pokemona.

## ⚙️ Instrukcja uruchomienia lokalnego

Aby uruchomić projekt na swoim komputerze, upewnij się, że masz zainstalowane środowisko **Node.js**, a następnie wykonaj poniższe kroki:

1. **Pobierz projekt:**
   Sklonuj repozytorium za pomocą Gita lub pobierz jako plik ZIP i rozpakuj.
   ```bash
   git clone <TUTAJ_WKLEJ_LINK_DO_SWOJEGO_REPOZYTORIUM>

Przejdź do folderu z projektem:
   cd pokemon-reactive-battle
   
Zainstaluj zależności:
   npm install
   
Uruchom aplikację:
   npm run dev
   
Otwórz w przeglądarce:
   http://localhost:5173

   Autor projektu: Tymoteusz Wilczyński
