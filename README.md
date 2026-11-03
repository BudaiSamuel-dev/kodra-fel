# Kódra fel! 3.0

Magyar nyelvű, előismeret nélkül elkezdhető pályaorientációs tech-játszótér a szoftverfejlesztő és -tesztelő technikus képzés iránt érdeklődő diákoknak.

A 2.0 változat újraírása **Vue 3 + Quasar** alapon, átlátható, bővíthető kódbázissal. A funkciók és a kinézet megegyeznek a 2.0-val (képernyőképenként, pixelre összevetve).

- **9 robotpálya** három nehézségi szinten, ismétléssel, útvonaltippel, Profi szinten adatcsippel
- **9 teszthelyzet** szándékosan hibás demóappokkal, próbanaplóval
- **3 miniapp**, amelyek önálló HTML-fájlként letölthetők
- **2 bónuszjáték**, **15 fogalmas tudástár**, szakmabemutató, **11 jelvény**, legfeljebb **1905 XP**
- Sötét/világos téma, mobilos navigáció, billentyűzettel is kezelhető, csökkentett mozgás támogatása

## Indítás

```sh
npm install      # egyszer, internetes gépen
npm run dev      # http://localhost:4173
```

Futás közben nincs szükség internetre: a betűkészletek és az ikonok a projektben vannak.

## Szerkezet

| Mappa | Mi van benne |
|---|---|
| `src/data/` | **Minden tartalom**: pályák, teszthelyzetek, miniappok, kvíz, tudástár. Új kérdés vagy pálya felvételéhez elég ezt szerkeszteni. |
| `src/logic/` | Tiszta játéklogika (útkeresés, labirintus, XP, mentés). Unit tesztekkel lefedve. |
| `src/stores/game.js` | Pinia store: a teljes játékállapot, automatikus mentés a böngészőbe. |
| `src/pages/`, `src/components/` | Vue oldalak és komponensek. |
| `src/css/kodra.css` | A teljes stílus (a 2.0 két stíluslapja összevonva). `reset.scss` semlegesíti a Quasar ütköző alapstílusait. |
| `legacy/` | A 2.0 teljes forrása referenciaként. |

## Tesztek

```sh
npm run test:unit   # Vitest
npm run test:e2e    # Playwright (a /usr/bin/chromium böngészővel; másik útvonal: CHROMIUM_PATH)
npm run lint
```

## Átírás állapota (3.0)

- [x] Váz, layout, téma, főoldal
- [x] Adat- és logikaréteg + unit tesztek
- [x] Robotjáték (+ E2E teszt mind a 9 pályára)
- [x] Tesztelő küldetés (+ E2E teszt mind a 9 helyzetre)
- [x] Miniapp-építő + export (+ E2E teszt a letöltött appra is)
- [x] Bónuszok, eredményoldal, tudástár, szakma, jelvények
- [x] Playwright E2E tesztek (teljes kaland 1905 XP-ig, 5 szélesség × 2 téma)
- [x] CSS összevonás egy fájlba

## Közös gépen

Az **Új felfedező** gomb (súgóablak vagy Jelvényeim oldal) törli az összes helyi játékhaladást; a színmód megmarad.

A haladás a böngésző helyi tárhelyén marad (`kodra-fel-v2` kulcs, a 2.0 mentései átjönnek); az alkalmazás nem küld adatot külső szolgáltatásnak.
