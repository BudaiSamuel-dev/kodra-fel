// A három nehézségi szint. Az xp a küldetésenként járó jutalom.
export const DIFFICULTIES = [
  {
    id: 'explorer',
    name: 'Felfedező',
    level: '01',
    icon: 'leaf',
    desc: 'Az első lépésekhez. Rövid pályák, konkrét segítség.',
    tag: 'ITT KEZDD',
    xp: 100
  },
  {
    id: 'challenger',
    name: 'Kihívó',
    level: '02',
    icon: 'bolt',
    desc: 'Labirintusok, ismétlések és trükkösebb tesztek.',
    tag: 'JÖHET EGY CSAVAR',
    xp: 150
  },
  {
    id: 'expert',
    name: 'Profi',
    level: '03',
    icon: 'rocket',
    desc: 'Nagyobb pályák, adatcsipek és határértékek.',
    tag: 'GONDOLKODJ TOVÁBB',
    xp: 200
  }
]
