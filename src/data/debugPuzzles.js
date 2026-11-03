// Kódnyomozó bónusz: 3 logikai fejtörő.
export const DEBUG_PUZZLES = [
  {
    title: 'A fordított sorrend',
    description:
      'Bitnek előbb a cipőt, aztán a kabátot kell felvennie, és csak utána indulhat ki. Melyik sorrend helyes?',
    code: ['indulás()', 'cipő_fel()', 'kabát_fel()'],
    options: ['indulás → cipő → kabát', 'cipő → kabát → indulás', 'kabát → indulás → cipő'],
    correct: 1,
    why: 'Az utasítások sorrendje meghatározza a működést. Az algoritmust előbb fejben is végig tudod játszani.'
  },
  {
    title: 'Az egyetlen hiányzó jel',
    description:
      'A klub 14 éves kortól nyitott. A kód most ezt mondja: „HA életkor > 14”. Melyik javítás engedi be a 14 éveseket is?',
    code: ['HA életkor > 14', '  belépés_engedélyezve()'],
    options: ['életkor < 14', 'életkor = 13', 'életkor ≥ 14'],
    correct: 2,
    why: 'A ≥ jelentése: nagyobb vagy egyenlő. Egy apró különbség a feltételben sok felhasználót érinthet.'
  },
  {
    title: 'Sose ér véget?',
    description:
      'Egy játékban a pontszám 0-ról indul. Minden körben eggyel nő, és 3-nál meg kell állnia. Mi legyen az ismétlés feltétele?',
    code: ['pont = 0', 'AMÍG ???', '  pont = pont + 1'],
    options: ['pont < 3', 'pont > 3', 'pont ≥ 0'],
    correct: 0,
    why: 'A „pont < 3” kezdetben igaz, majd 3-nál hamis lesz, ezért az ismétlés befejeződik. A „pont ≥ 0” soha nem állna le ebben a példában.'
  }
]
