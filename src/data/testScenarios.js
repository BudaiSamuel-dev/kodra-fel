// Tesztelő küldetés: szintenként 3 helyzet. A hibás működést a logic/testOutput.js szimulálja (kind alapján).
export const TEST_SCENARIOS = {
  explorer: [
    {
      title: 'A kedvezmény',
      kind: 'coupon',
      label: 'Kuponkód',
      inputType: 'text',
      value: '',
      placeholder: 'Próbáld ezt: DIÁK',
      task: 'A DIÁK kupon 500 Ft kedvezményt ad a 2 000 Ft-os jegyből. A fizetendő ár így 1 500 Ft.',
      probes: ['DIÁK'],
      options: [
        'A helyes kuponnal is 2 000 Ft marad az ár.',
        'A jegy ingyenes lett.',
        'Az app helyesen működik.'
      ],
      correct: 0,
      explanation:
        'A várt ár 1 500 Ft, a tényleges 2 000 Ft. A kupon elfogadása önmagában nem bizonyítja, hogy a kedvezmény működik.'
    },
    {
      title: 'Az üres név',
      kind: 'name',
      label: 'A neved',
      inputType: 'text',
      value: '',
      placeholder: 'Próbáld ki üresen!',
      task: 'A jelentkezést csak valódi névvel szabad elküldeni. Üres vagy csak szóközökből álló névnél hibaüzenet kell.',
      probes: [''],
      options: ['A gomb túl kicsi.', 'Név nélkül is sikeresnek jelzi a jelentkezést.', 'Nincs hiba.'],
      correct: 1,
      explanation:
        'Az üres mező fontos teszteset. A tesztelő nem csak azt próbálja ki, amikor a felhasználó mindent szabályosan kitölt.'
    },
    {
      title: 'A korhatár',
      kind: 'age',
      label: 'Életkor',
      inputType: 'number',
      value: '14',
      task: 'A programra 14 éves kortól lehet jelentkezni. Egy 14 éves jelentkezőt már el kell fogadni.',
      probes: ['14'],
      options: ['A 13 éveseket is elfogadja.', 'Mindenkit elfogad.', 'A 14 éves jelentkezőt is elutasítja.'],
      correct: 2,
      explanation:
        'A 14 év egy határérték. A „nagyobb mint 14” és a „legalább 14” közti eltérés egyetlen jel, mégis más eredményt ad.'
    }
  ],
  challenger: [
    {
      title: 'A mínuszos kosár',
      kind: 'quantity',
      label: 'Jegyek száma',
      inputType: 'number',
      value: '2',
      task: '1–5 darab jegy vásárolható, darabonként 1 000 Ft-ért. A tartományon kívül hibaüzenet kell.',
      probes: ['2', '-1'],
      options: [
        'Negatív darabszámból negatív végösszeget számol.',
        'Két jegy ára nem 2 000 Ft.',
        'Minden darabszámot elutasít.'
      ],
      correct: 0,
      explanation:
        'A 2 egy szabályos érték, a −1 egy érvénytelen. A negatív végösszeg jelzi, hogy a bemeneti ellenőrzés hiányzik.'
    },
    {
      title: 'A válogatós kereső',
      kind: 'search',
      label: 'Keresés',
      inputType: 'text',
      value: 'Robot',
      task: 'A keresőben a Robot és robot ugyanazt a „Robotépítő műhely” találatot kell hogy adja. Kis- és nagybetű ne számítson.',
      probes: ['Robot', 'robot'],
      options: [
        'Egyik keresés sem ad találatot.',
        'A kisbetűs robot nem ad találatot.',
        'Két különböző programot mutat.'
      ],
      correct: 1,
      explanation:
        'Az azonos jelentésű, eltérő alakú bemeneteket is érdemes ellenőrizni. Ez itt kis- és nagybetűk kezelési hibája.'
    },
    {
      title: 'Pont nyolc karakter',
      kind: 'length',
      label: 'Felhasználónév',
      inputType: 'text',
      value: 'bit',
      task: 'A felhasználónév 1–8 karakter hosszú lehet, tehát a 8 karakteres bitrobot még érvényes.',
      probes: ['bit', 'bitrobot'],
      options: [
        'Minden nevet elfogad.',
        'A rövid nevet is elutasítja.',
        'A pontosan 8 karakteres nevet már túl hosszúnak jelzi.'
      ],
      correct: 2,
      explanation:
        'A maximális megengedett hossz külön tesztet érdemel. A „legfeljebb nyolc” a nyolcat is tartalmazza.'
    }
  ],
  expert: [
    {
      title: 'Az ingyenes szállítás',
      kind: 'shipping',
      label: 'Kosárérték (Ft)',
      inputType: 'number',
      value: '9999',
      task: '10 000 Ft-tól a szállítás ingyenes. Alatta 990 Ft. Ellenőrizd a határ alatti, a pontos és a határ fölötti értéket!',
      probes: ['9999', '10000', '10001'],
      options: [
        'Pont 10 000 Ft-nál is felszámít 990 Ft-ot.',
        '9 999 Ft-nál ingyenes a szállítás.',
        '10 001 Ft-nál fizetős a szállítás.'
      ],
      correct: 0,
      explanation:
        'A határérték környékének három pontját tesztelted. A hiba csak pontosan 10 000 Ft-nál látszik.'
    },
    {
      title: 'Belépés a klubba',
      kind: 'range',
      label: 'Életkor',
      inputType: 'number',
      value: '16',
      task: 'A klubba 14–18 évesek léphetnek be, a két szélső életkort is beleértve. A 13 és a 19 nem megengedett.',
      probes: ['13', '16', '19'],
      options: [
        'A 16 éveseket is elutasítja.',
        'A tartomány alatti és feletti jelentkezőket is elfogadja.',
        'Csak a 18 éveseket fogadja el.'
      ],
      correct: 1,
      explanation:
        'A hibás szabály VAGY kapcsolatot használ ÉS helyett. Az életkornak egyszerre legalább 14-nek és legfeljebb 18-nak kell lennie.'
    },
    {
      title: 'Biztos, hogy hibás?',
      kind: 'healthy',
      label: 'Megjelenítendő név',
      inputType: 'text',
      value: '',
      task: 'Az app utasítsa el az üres és csak szóközös nevet, a Bit nevet pedig fogadja el. Ne találj ki hibát, ha az ellenőrzött esetek jól működnek!',
      probes: ['', '   ', 'Bit'],
      options: [
        'Minden beírt nevet elutasít.',
        'A szóközöket érvényes névnek veszi.',
        'A három tesztelt esetben nincs eltérés a szabálytól.'
      ],
      correct: 2,
      explanation:
        'A jó tesztelő azt is megállapítja, ha a vizsgált esetek helyesen működnek. Ez nem jelenti azt, hogy minden lehetséges hibát kizártál.'
    }
  ]
}
