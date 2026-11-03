// Tech radar bónusz: 6 kérdés magyarázattal.
export const QUIZ = [
  {
    q: 'Mit jelent az algoritmus?',
    options: ['Egy titkos jelszót.', 'Egy megoldás lépéseinek sorrendjét.', 'Egy számítógép márkáját.'],
    correct: 1,
    why: 'Egy recept vagy egy robot útvonala is algoritmus lehet: megmondja, mit milyen sorrendben tegyünk.'
  },
  {
    q: 'Elsőre nem működik a programod. Mit teszel?',
    options: [
      'Végignézem a lépéseket, és újra kipróbálom.',
      'Biztosan nem nekem való a fejlesztés.',
      'Véletlenszerűen átírok mindent.'
    ],
    correct: 0,
    why: 'A hibakeresés a fejlesztés természetes része. Megfigyelésből és kisebb javításokból jutsz előre.'
  },
  {
    q: 'Melyik a leghasznosabb hibajelentés?',
    options: [
      '„Rossz az app.”',
      '„Nem szeretem a színét.”',
      '„Üres névvel elküldve is sikeresnek jelzi a jelentkezést.”'
    ],
    correct: 2,
    why: 'A pontos leírás megmutatja a kiváltó lépést és a megfigyelt eredményt. Így más is meg tudja ismételni.'
  },
  {
    q: 'Miért használunk ismétlést a programban?',
    options: [
      'Hogy ugyanazt a lépést többször, rövidebben adhassuk meg.',
      'Hogy lassabb legyen a gép.',
      'Mert a gép elfelejti az utasításokat.'
    ],
    correct: 0,
    why: 'A ciklus egy utasítást vagy egy egész utasítássort ismételhet. A robotjátékban a ×3 ugyanazt a nyilat háromszor futtatja.'
  },
  {
    q: 'Csak egyedül dolgozik egy fejlesztő?',
    options: [
      'Igen, a csapatmunka nem számít.',
      'Nem, gyakran más fejlesztőkkel, tesztelőkkel és tervezőkkel dolgozik.',
      'Csak a gépével beszél.'
    ],
    correct: 1,
    why: 'Egy alkalmazás közös munka: az ötletek, a megvalósítás és az ellenőrzés folyamatosan találkoznak.'
  },
  {
    q: 'Mire érdemes használni az AI által javasolt kódot?',
    options: ['Ellenőrzés nélkül bemásolni.', 'Mindig elutasítani.', 'Megérteni, kipróbálni és ellenőrizni.'],
    correct: 2,
    why: 'Az AI adhat ötletet, de tévedhet. Az alapok segítenek megítélni, hogy a javaslat helyes és a célodhoz illik-e.'
  }
]
