# Kódra fel! 3.0

Magyar nyelvű, előismeret nélkül elkezdhető pályaorientációs tech-játszótér a szoftverfejlesztő és -tesztelő technikus képzés iránt érdeklődő diákoknak.

A 2.0 változat újraírása **Vue 3 + Quasar** alapon, átlátható, bővíthető kódbázissal. A funkciók és a kinézet megegyeznek a 2.0-val.

> 🚧 Folyamatban: az átírás lépésenként halad, lásd lent.

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
| `src/css/legacy/` | A 2.0 stílusa (még összevonásra vár). |
| `legacy/` | A 2.0 teljes forrása referenciaként. |

## Tesztek

```sh
npm run test:unit   # Vitest
npm run lint
```

## Átírás állapota

- [x] Váz, layout, téma, főoldal
- [x] Adat- és logikaréteg + unit tesztek
- [ ] Robotjáték
- [ ] Tesztelő küldetés
- [ ] Miniapp-építő + export
- [ ] Bónuszok, tudástár, szakma, jelvények
- [ ] Playwright E2E tesztek
- [ ] CSS összevonás és tisztítás

A haladás a böngésző helyi tárhelyén marad (`kodra-fel-v2` kulcs, a 2.0 mentései átjönnek); az alkalmazás nem küld adatot külső szolgáltatásnak.
