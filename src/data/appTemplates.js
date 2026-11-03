// Alkotó küldetés: a három miniapp sablonja. A "correct" a helyes HA-feltétel.
export const COLORS = ['#d5eaa9', '#e1d6f3', '#f5d4bd', '#bde5ed', '#f2e4a4']
export const COLOR_NAMES = ['Zöld', 'Lila', 'Barack', 'Kék', 'Sárga']

export const APP_TEMPLATES = [
  {
    id: 'mood',
    name: 'Hangulatjelző',
    icon: 'spark',
    desc: 'Egy jó szó pont akkor, amikor kell.',
    prompt: 'Ha szomorú vagyok, az app bátorítson. Ha vidám, örüljön velem!',
    choices: [
      ['happy', 'vidám 😊'],
      ['sad', 'szomorú 😔']
    ],
    correct: 'sad',
    default: 'happy',
    tests: [
      ['happy', 'Vidám 😊'],
      ['sad', 'Szomorú 😔']
    ],
    question: 'HA a hangulatom',
    then: '„Menni fog, lépésről lépésre! 💪”',
    otherwise: '„Szuper, csak így tovább! ✨”'
  },
  {
    id: 'ticket',
    name: 'Jegyárkalkulátor',
    icon: 'bolt',
    desc: 'A határérték most rajtad múlik.',
    prompt: '14 éves korig (a 14-et is beleértve) 1 000 Ft a jegy, felette 2 000 Ft.',
    choices: [
      ['lt', 'kisebb mint 14'],
      ['lte', 'legfeljebb 14'],
      ['gt', 'nagyobb mint 14']
    ],
    correct: 'lte',
    default: 'lt',
    tests: [
      ['13', '13 éves'],
      ['14', '14 éves'],
      ['15', '15 éves']
    ],
    question: 'HA az életkor',
    then: '1 000 Ft-os jegy',
    otherwise: '2 000 Ft-os jegy'
  },
  {
    id: 'focus',
    name: 'Fókuszbarát',
    icon: 'clock',
    desc: 'Kis logika, jobb tanulási ritmus.',
    prompt: 'Legalább 25 perc fókusz után javasolj szünetet. Előtte jelezd, hogy még tart a fókuszidő.',
    choices: [
      ['gt', 'több mint 25'],
      ['gte', 'legalább 25'],
      ['lte', 'legfeljebb 25']
    ],
    correct: 'gte',
    default: 'gt',
    tests: [
      ['24', '24 perc'],
      ['25', '25 perc'],
      ['26', '26 perc']
    ],
    question: 'HA a fókuszidő',
    then: '„Jöhet egy rövid szünet! 🌿”',
    otherwise: '„Még egy kis fókusz! 🎯”'
  }
]
