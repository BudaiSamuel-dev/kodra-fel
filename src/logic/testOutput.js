// A TesztLab gyakorlóalkalmazás válasza egy bemenetre. A hibák SZÁNDÉKOSAK — ezeket kell a diákoknak megtalálni.
// Kivétel: a "healthy" eset helyesen működik.
export function testOutput(kind, value) {
  const n = Number(value)
  const v = value.trim()
  switch (kind) {
    case 'coupon': // hiba: a kupont elfogadja, de az ár nem csökken
      return v.normalize('NFC').toLocaleUpperCase('hu-HU') === 'DIÁK'
        ? 'Kupon elfogadva! Fizetendő: 2 000 Ft'
        : 'Nincs kedvezmény. Fizetendő: 2 000 Ft'
    case 'name': // hiba: üres névvel is sikeres
      return 'Sikeres jelentkezés! ✓'
    case 'age': // hiba: > 14 a >= 14 helyett
      return v && n > 14 ? 'Jelentkezés elfogadva ✓' : 'Legalább 14 évesnek kell lenned.'
    case 'quantity': // hiba: negatív darabszámot nem szűr
      return !v || !Number.isInteger(n) || n === 0 || n > 5
        ? 'Érvénytelen darabszám.'
        : `Fizetendő: ${(n * 1000).toLocaleString('hu-HU')} Ft`
    case 'search': // hiba: kis- és nagybetű érzékeny
      return v === 'Robot' ? 'Találat: Robotépítő műhely' : 'Nincs találat.'
    case 'length': // hiba: < 8 a <= 8 helyett
      return v.length > 0 && v.length < 8 ? 'Név elfogadva ✓' : 'A név túl rövid vagy túl hosszú.'
    case 'shipping': // hiba: > 10000 a >= 10000 helyett
      return !v || n < 0 ? 'Érvénytelen kosárérték.' : n > 10000 ? 'Szállítás: 0 Ft' : 'Szállítás: 990 Ft'
    case 'range': // hiba: VAGY az ÉS helyett
      return !v || !Number.isInteger(n) || n < 0 || n > 120
        ? 'Érvénytelen életkor.'
        : n >= 14 || n <= 18
          ? 'Belépés engedélyezve ✓'
          : 'A klub 14–18 éveseknek szól.'
    case 'healthy':
      return v ? 'Név elfogadva ✓' : 'Adj meg egy nevet!'
  }
}

// Hogyan jelenjen meg egy bemenet a próbanaplóban.
export function probeLabel(value) {
  return value === '' ? 'üres mező' : value.trim() === '' ? `${value.length} szóköz` : value
}
