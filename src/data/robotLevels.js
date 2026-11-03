import { maze } from 'logic/maze'

// A Kihívó és Profi pályák seedből generált labirintusok: ugyanaz a seed mindig ugyanazt a pályát adja.
const MAZE_TEXT = {
  intro: 'Találd meg az átjárókat! Egy nyilat most többször is ismételhetsz egyetlen utasításblokkal.',
  note: 'Az ismétlés ugyanazt a lépést többször futtatja. A → ×3 ugyanaz, mint három jobbra nyíl.'
}
const CHIP_TEXT = {
  intro:
    'Vedd fel a lila adatcsipet, majd juttasd Bitet a csillaghoz! Az ismétlésekkel kevesebb blokk is elég.',
  note: 'A feltétel ellenőrzése is a program része: a célba érés önmagában nem elég, ha a csip még hiányzik.'
}

export const ROBOT_LEVELS = {
  explorer: [
    {
      size: 5,
      start: [0, 2],
      goal: [3, 2],
      walls: [
        [1, 0],
        [3, 0],
        [1, 4],
        [3, 4]
      ],
      title: 'Az első utasításaid',
      intro:
        'Kattints a nyilakra, és juttasd el Bitet a csillaghoz. Nem kell kódot írnod: minden nyíl egy lépés!',
      note: 'Az algoritmus egy feladat megoldásának lépéseit jelenti. Mint egy recept: a sorrend számít.'
    },
    {
      size: 5,
      start: [0, 4],
      goal: [4, 0],
      walls: [
        [1, 4],
        [1, 3],
        [3, 2],
        [2, 1]
      ],
      title: 'Kerüld meg az akadályt!',
      intro: 'Bit pontosan azt teszi, amit kérsz. Tervezd meg az egész útvonalat, majd indítsd a programot!',
      note: 'A gép nem találja ki, mire gondoltál. Ha mást csinál, mint tervezted, vizsgáld meg az utasításokat.'
    },
    {
      size: 5,
      start: [0, 4],
      goal: [4, 0],
      walls: [
        [0, 2],
        [1, 2],
        [3, 4],
        [3, 3],
        [3, 1],
        [4, 1]
      ],
      title: 'Találd meg az átjárót!',
      intro: 'Az utolsó pályán már neked kell megkeresned a jó irányt. A szürke mezők akadályok.',
      note: 'Kipróbálod, megfigyeled, javítod. A fejlesztők is sokszor végigmennek ezen a körön.'
    }
  ],
  challenger: [
    { ...maze(7, 721), title: 'A labirintus bejárata', ...MAZE_TEXT },
    { ...maze(7, 164), title: 'Gondolkodj ismétlésekben!', ...MAZE_TEXT },
    { ...maze(7, 928), title: 'A kanyarok mestere', ...MAZE_TEXT }
  ],
  expert: [
    { ...maze(9, 87, { chip: true }), title: 'Adatmentő küldetés', ...CHIP_TEXT },
    { ...maze(9, 513, { chip: true }), title: 'A rejtett folyosó', ...CHIP_TEXT },
    { ...maze(9, 1029, { chip: true }), title: 'Bit utolsó kihívása', ...CHIP_TEXT }
  ]
}
