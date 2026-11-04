# Kódra fel! 2.0

Magyar nyelvű, előismeret nélkül elkezdhető pályaorientációs tech-játszótér szoftverfejlesztő és -tesztelő technikus képzés iránt érdeklődő diákoknak.

## A rendezvényen

A **Felfedező** alapútvonal 5–10 percre készült. A Kihívó, Profi és a bónuszjátékok hosszabb, szabad felfedezésre valók. Nincs időkorlát vagy pontlevonás.

- **3 valódi nehézségi útvonal:** külön robotpályákkal, tesztesetekkel és külön mentett haladással.
- **9 robotpálya:** 5×5, 7×7 és 9×9 mező, utasításblokkok, ×1–4 ismétlés, visszavonás, ütközéskezelés, útvonaltipp. Profi szinten adatcsipet is kell gyűjteni.
- **9 teszthelyzet:** kedvezmény, üres mező, korhatár, negatív kosár, kis- és nagybetű, szöveghossz, ingyenes szállítás, tartomány és helyes működés felismerése. A próbanapló megmutatja az elvégzett ellenőrzéseket.
- **3 választható miniapp:** Hangulatjelző, Jegyárkalkulátor és Fókuszbarát. Öt szín, saját név, választható feltétel, kötelező újratesztelés szabályváltás után. A helyes app önálló HTML-fájlként letölthető.
- **2 bónuszjáték:** Kódnyomozó (3 logikai fejtörő), Tech radar (6 kérdés magyarázattal).
- **15 fogalmas tudástár:** ékezetfüggetlen keresés, kategóriák, hétköznapi példák.
- **Bővebb szakmabemutató:** fejlesztői és tesztelői illusztratív munkanap, tanulási út, projektötletek és gyakori kérdések.
- **11 jelvény, legfeljebb 1905 XP:** a jutalom egyszer jár egy adott teljesítésért. Nincs ranglista, alkalmassági minősítés vagy diákfiók.
- Sötét/világos téma, mobilos navigáció és csökkentett mozgás támogatása.

Közös gépen az **Új felfedező** gombbal lehet törölni az összes helyi játékhaladást. A színmód megmarad. A korábbi változat Felfedező-haladása és miniappja átkerül az új mentésbe.

A haladás a böngésző helyi tárhelyén marad; az alkalmazás nem küld játékadatokat külső szolgáltatásnak. Minden feladat billentyűzettel is elérhető (Tab, Enter/Space); az Escape bezárja a párbeszédablakot.

## Helyi futtatás

A `dist` a kész statikus oldal; nincs csomagtelepítés vagy buildlépés. A betűkészletek, licencek és grafikák helyben vannak.

```sh
python -m http.server 4173 --directory dist
```

Megnyitás: http://localhost:4173

Az offline csomag a segítségablakból letölthető. Újragenerálás forrásváltozás után:

```sh
python scripts/package-offline.py
```

Közvetlen `index.html` megnyitáskor a helyi mentés és a fájlhozzáférés a böngésző szabályaitól függ. Az iskolai gépeken a helyi HTTP-kiszolgáló megbízhatóbb.

## Ellenőrzés

A `qa/smoke.py` a Playwright Python csomaggal és `/usr/bin/chromium` böngészővel, a 4173-as porton futó kiszolgáló mellett ellenőrizhető:

```sh
python qa/smoke.py
```

A teszt egy független útkereséssel végigjátssza a 9 robotpályát, a 9 teszthelyzetet és a 3 miniappot; ellenőrzi az exportok működését, a bónuszokat, az XP-t, a jelvényeket, a keresést, a mentést, az újrakezdést és öt képernyőméretet mindkét témában. Az automatikus akadálymentességi ellenőrzés nem helyettesít felhasználói tesztelést.

A tantervi és munkanapos példák szemléltetők. Konkrét iskolai ígéretet, óraszámot, fizetési adatot vagy felvételi követelményt nem állítunk.
