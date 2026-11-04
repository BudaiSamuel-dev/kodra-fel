from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
root=Path(__file__).resolve().parents[1]/'dist'
out=root/'kodra-fel-offline.zip'
with ZipFile(out,'w',ZIP_DEFLATED) as z:
    for p in sorted(root.rglob('*')):
        if not p.is_file() or p==out: continue
        if p.name=='index.html':
            z.writestr('index.html',p.read_text().replace('<html lang="hu">','<html lang="hu" data-offline>'))
        else:z.write(p,p.relative_to(root))
    z.writestr('OLVASS-EL.txt','''KÓDRA FEL! 2.0 – Pályaorientációs tech-játszótér

Csomagold ki az EGÉSZ mappát. Az index.html modern böngészőben megnyitható.
Ha az iskolai böngésző tiltja a közvetlen fájlmegnyitást, indíts helyi kiszolgálót:
  python -m http.server 4173
Majd nyisd meg: http://localhost:4173

A játékhoz nincs szükség internetre. Minden betűkészlet és grafika a csomagban van.
A haladás mentése közvetlen fájlmegnyitásnál böngészőfüggő; HTTP-n megbízhatóbb.

Felfedező: 5–10 perces alapútvonal. Kihívó és Profi: további kihívások.
9 robotpálya, 9 teszthelyzet, 3 választható és letölthető miniapp, 2 bónuszjáték.
15 fogalmas tudástár, szakmabemutató és 11 megszerezhető jelvény.

Tab: lépkedés a vezérlők között. Enter/Space: kiválasztás. Escape: ablak bezárása.
A következő diákhoz a segítségablak Új felfedező gombja törli az összes helyi haladást.
A három nehézségi szint haladása egymástól függetlenül megmarad.
Az XP nem osztályzat vagy pályaalkalmassági értékelés.

A képzés pontos tartalmáról és felvételi feltételeiről az adott iskolát kérdezd!
''')
print('Offline package:',out.stat().st_size,'bytes')
