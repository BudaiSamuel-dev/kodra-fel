// "A szakmáról" oldal tartalma. Szemléltető példák, nem konkrét iskolai vagy munkahelyi ígéretek.

export const PROFESSION_CARDS = [
  {
    role: 'dev',
    icon: 'code',
    label: 'A FEJLESZTŐ',
    question: '„Hogyan csináljuk meg?”',
    text: 'Ötletekből működő alkalmazásokat készít. Kisebb lépésekre bontja a feladatot, utasításokat ír a számítógépnek, és javítja a megoldását.',
    skills: ['Logikus gondolkodás', 'Kreativitás és problémamegoldás', 'Kitartás, amikor elsőre nem sikerül'],
    mission: 0
  },
  {
    role: 'test',
    icon: 'bug',
    label: 'A TESZTELŐ',
    question: '„Biztosan jól működik?”',
    text: 'Úgy próbálja ki az alkalmazást, ahogy a felhasználók tennék. Szokatlan helyzeteket is ellenőriz, és pontosan leírja, ha hibát talál.',
    skills: [
      'Figyelem a részletekre',
      'Kíváncsiság: „És mi történik, ha…?”',
      'Világos, érthető kommunikáció'
    ],
    mission: 1
  }
]

export const SCHOOL_TOPICS = [
  ['code', 'Programozási alapok'],
  ['grid', 'Weboldalak és alkalmazások'],
  ['bug', 'Szoftvertesztelés'],
  ['people', 'Közös projektmunka']
]

// [időpont, cím, leírás]
export const WORKDAYS = {
  dev: [
    [
      '09:00',
      'Egyeztetés',
      'A csapat megbeszéli, min dolgozik. Te jelzed, hogy a jegyvásárló oldal űrlapját készíted.'
    ],
    [
      '10:00',
      'Tervezés és kódolás',
      'Kisebb feladatokra bontod a munkát: beviteli mezők, kedvezményszámítás, visszajelzés.'
    ],
    [
      '13:00',
      'Kipróbálás',
      'Ellenőrzöd a kódodat. A tesztelő jelzi, hogy a 14 évesek kedvezménye nem működik.'
    ],
    [
      '15:00',
      'Javítás és közös átnézés',
      'Megkeresed az eltérő feltételt. Egy másik fejlesztő átnézi a változtatást, majd újra teszteltek.'
    ]
  ],
  test: [
    [
      '09:00',
      'A feladat megértése',
      'Elolvasod, hogyan kellene működnie a jegyvásárlásnak. Kérdezel, ha a korhatár nem egyértelmű.'
    ],
    [
      '10:00',
      'Tesztesetek tervezése',
      'Összegyűjtöd a próbákat: üres név, helyes kupon, 13/14/15 éves kor. Leírod a várt eredményeket.'
    ],
    [
      '13:00',
      'Próbák és hibajelentés',
      'Megismételhető lépésekben leírod: 14 éves kor + kupon → nincs kedvezmény, pedig járna.'
    ],
    [
      '15:00',
      'Újratesztelés',
      'A javítás után ellenőrzöd az eredeti hibát és a közeli eseteket is, nehogy valami más romoljon el.'
    ]
  ]
}

export const ROADMAP = [
  ['01', 'Alapok', 'Logika, egyszerű algoritmusok, adatok és első programok.'],
  ['02', 'Alkalmazások', 'Webes felületek, háttérlogika és adatbázisok összekapcsolása.'],
  ['03', 'Minőség', 'Tesztesetek, hibajelentések és később automatizált ellenőrzések.'],
  ['04', 'Közös projektek', 'Feladatmegosztás, verziókezelés, bemutatás és visszajelzés.']
]

// [ikon, cím, leírás]
export const PROJECT_IDEAS = [
  [
    'clock',
    'Tanulástervező',
    'Feladatlista és határidők. Fejlesztőként megvalósítod a mentést; tesztelőként ellenőrzöd a lejárt és üres dátumokat.'
  ],
  [
    'people',
    'Iskolai eseményapp',
    'Jelentkezés egy programra. Megtervezed az űrlapot, majd kipróbálod, mi történik az utolsó szabad helynél.'
  ],
  [
    'rocket',
    'Saját böngészős játék',
    'Pontszám, pályák, újrakezdés. A tesztjeid megmutatják, tényleg helyesen számolja-e a találatokat.'
  ]
]

// [kérdés, válasz]
export const FAQ = [
  [
    'Kell már tudnom programozni a jelentkezéshez?',
    'Ez a bemutató előismeret nélkül készült. A konkrét felvételi feltételeket az adott technikum tájékoztatójában ellenőrizd. A kíváncsiságot, a rendszeres gyakorlást és a segítségkérést már most érdemes magaddal hoznod.'
  ],
  [
    'Csak annak való, aki zseni matekból?',
    'A logikus gondolkodás és a matematikai alapok hasznosak, de a fejlesztés sok tanulható készségből áll: feladatbontás, pontos megfogalmazás, gyakorlás és együttműködés. Egy rövid játék nem dönti el, kinek való a szakma.'
  ],
  [
    'A tesztelő csak nyomkodja a gombokat?',
    'A kipróbálás mögött terv van. A tesztelő megérti a követelményeket, megtervezi az eseteket, értékeli az eredményt és jól megfogalmazott visszajelzést ad. Később kóddal automatizálhatja az ismétlődő ellenőrzéseket.'
  ],
  [
    'Miért tanuljak programozást, ha van AI?',
    'Az AI segíthet ötletelni és kódot írni, de a cél megértése, a döntések és az ellenőrzés továbbra is számítanak. Az alapokkal felismered a hibás javaslatokat, és tudatosabban használod az eszközt.'
  ],
  [
    'Milyen irányokba indulhatok tovább?',
    'A megszerzett alapokra épülhet például webfejlesztés, alkalmazásfejlesztés, tesztautomatizálás vagy további informatikai tanulmány. A konkrét lehetőségekhez a képzés tartalmát, a további követelményeket és a saját érdeklődésedet is nézd meg.'
  ],
  [
    'Mit kérdezzek a nyílt napon?',
    'Kérj diákprojekt-bemutatót! Kérdezd meg: „Hogyan segítetek, ha elakadok?”, „Milyen eszközökkel dolgozunk?”, „Mennyi a közös projekt?”, „Hogyan gyakoroljuk a tesztelést?”, „Mi a pontos felvételi feltétel?”'
  ]
]
