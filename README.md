# Kódra fel! 3.0

Magyar nyelvű, előismeret nélkül elkezdhető pályaorientációs tech-játszótér a szoftverfejlesztő és -tesztelő technikus képzés iránt érdeklődő diákoknak.

A 2.0 változat újraírása **Vue 3 + Quasar** alapon, átlátható, bővíthető kódbázissal. A funkciók és a kinézet megegyeznek a 2.0-val (képernyőképenként, pixelre összevetve).

- **9 robotpálya** három nehézségi szinten, ismétléssel, útvonaltippel, Profi szinten adatcsippel
- **9 teszthelyzet** szándékosan hibás demóappokkal, próbanaplóval
- **3 miniapp**, amelyek önálló HTML-fájlként letölthetők
- **2 bónuszjáték**, **15 fogalmas tudástár**, szakmabemutató, **11 jelvény**, legfeljebb **1905 XP**
- Sötét/világos téma, mobilos navigáció, billentyűzettel is kezelhető, csökkentett mozgás támogatása
- Külön bekapcsolható, webkamerás AR kézvezérlés minden oldal alján

## Indítás

```sh
npm install      # egyszer, internetes gépen
npm run dev      # http://localhost:4173
```

Futás közben nincs szükség internetre: a betűkészletek és az ikonok a projektben vannak.

## AR kézvezérlés

Az oldal alján az **AR kézvezérlés bekapcsolása** gomb indítja a kamerát. HTTPS (fejlesztéskor localhost), kameraengedély és WebAssemblyt támogató, naprakész böngésző szükséges; elsősorban asztali Chrome/Edge használata ajánlott. Az AR előnézet a tükrözött kameraképre rajzolja a kéz 21 követési pontját. Egy kézzel, jó megvilágításban használd.

- **Mutatóujj:** a képernyőkurzor mozgatása; a célba vett kezelőelem zöld keretet kap.
- **Csippentés:** legalább 180 ms rámutatás után érintsd össze a hüvelyk- és mutatóujjad a kattintáshoz. Újabb kattintáshoz engedd szét őket. A kurzor csippentés alatt rögzül.
- **Nyitott tenyér:** a felmutatás helyéhez képest fel/le mozgatva görget; középen holtzóna segít megállni. Görgethető ablakban az ablak tartalma mozog.
- **Ököl / kéz kivétele a képből:** nem hajt végre műveletet.
- **Leállítás / Esc:** a kamera és a felismerés leáll. Másik böngészőlapra váltáskor szintén leáll; nincs automatikus újraindítás. Oldalon belüli navigáció közben megmarad.
- A panel **− / +** gombja összecsukja/kinyitja az előnézetet és az útmutatót, miközben a kézvezérlés folytatódik.

A kattintás a meglévő gombokat, linkeket és beviteli mezőket kezeli; szövegbevitelhez és natív legördülőkhöz továbbra is billentyűzet/egér szükséges. Ez kísérleti funkció: a követés pontossága és sebessége a kamerától, fénytől és eszköztől függ.

A képek helyben, a böngészőben kerülnek feldolgozásra, hangot nem kérünk, felvétel és képfeltöltés nincs. A MediaPipe kódja, WASM-fájljai és modellje saját eredetről, csak bekapcsoláskor töltődnek be. Az `npm install`/`npm ci` postinstall lépése a rögzített `@mediapipe/tasks-vision` csomag WASM-fájljait a `public/hand-tracking/wasm/` mappába másolja; a modell a repó része. Telepítés után a funkcióhoz sincs szükség külső CDN-re. A tárhelyen a `.wasm` és `.task` fájlokat is ki kell szolgálni; a felismerő erőforrásai összesen kb. 20 MB-ot töltenek be indításkor.

## Szerkezet

| Mappa | Mi van benne |
|---|---|
| `src/data/` | **Minden tartalom**: pályák, teszthelyzetek, miniappok, kvíz, tudástár. Új kérdés vagy pálya felvételéhez elég ezt szerkeszteni. |
| `src/logic/` | Tiszta játéklogika (útkeresés, labirintus, XP, mentés). Unit tesztekkel lefedve. |
| `src/stores/game.js` | Pinia store: a teljes játékállapot, automatikus mentés a böngészőbe. |
| `src/pages/`, `src/components/` | Vue oldalak és komponensek. |
| `src/css/kodra.css` | A teljes stílus (a 2.0 két stíluslapja összevonva). `reset.scss` semlegesíti a Quasar ütköző alapstílusait, `light.scss` a világos téma palettája (zsálya háttér, elefántcsont felületek, szerepszínek: zöld fejlesztő, barack tesztelő, lila alkotó); `light-generated.css` generált (`npm run css:light`): a szövegkontrasztot emeli és a beégetett fehér háttereket cseréli; `dark.scss` ugyanezeket a szerepszíneket adja a sötét témának. |
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
