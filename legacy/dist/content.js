'use strict';

const DIFFICULTIES = [
  {id:'explorer', name:'Felfedező', level:'01', icon:'leaf', desc:'Az első lépésekhez. Rövid pályák, konkrét segítség.', tag:'ITT KEZDD', xp:100},
  {id:'challenger', name:'Kihívó', level:'02', icon:'bolt', desc:'Labirintusok, ismétlések és trükkösebb tesztek.', tag:'JÖHET EGY CSAVAR', xp:150},
  {id:'expert', name:'Profi', level:'03', icon:'rocket', desc:'Nagyobb pályák, adatcsipek és határértékek.', tag:'GONDOLKODJ TOVÁBB', xp:200}
];
const DIRECTIONS = {up:{label:'Fel',icon:'up',dx:0,dy:-1},right:{label:'Jobbra',icon:'arrow',dx:1,dy:0},down:{label:'Le',icon:'down',dx:0,dy:1},left:{label:'Balra',icon:'left',dx:-1,dy:0}};
function findRoute(level, from=level.start, to=level.goal) {
  const size=level.size, q=[[from,[]]], seen=new Set([from.join(',')]);
  for(let i=0;i<q.length;i++) { const [pos,path]=q[i]; if(pos[0]===to[0]&&pos[1]===to[1])return path;
    for(const [k,d] of Object.entries(DIRECTIONS)){const n=[pos[0]+d.dx,pos[1]+d.dy],key=n.join(',');if(n[0]<0||n[1]<0||n[0]>=size||n[1]>=size||seen.has(key)||level.walls.some(w=>w[0]===n[0]&&w[1]===n[1]))continue;seen.add(key);q.push([n,[...path,k]]);}
  } return [];
}
function maze(size,seed,title,chip=false){
  let rng=seed;const random=()=>{rng=(rng*1664525+1013904223)>>>0;return rng/4294967296;};
  const grid=Array.from({length:size},()=>Array(size).fill(1)),stack=[[0,size-1]];grid[size-1][0]=0;
  while(stack.length){const [x,y]=stack.at(-1);const neighbors=[[2,0],[-2,0],[0,2],[0,-2]].map(([dx,dy])=>[x+dx,y+dy]).filter(([nx,ny])=>nx>=0&&ny>=0&&nx<size&&ny<size&&grid[ny][nx]);if(!neighbors.length){stack.pop();continue;}const [nx,ny]=neighbors[Math.floor(random()*neighbors.length)];grid[(y+ny)/2][(x+nx)/2]=0;grid[ny][nx]=0;stack.push([nx,ny]);}
  const level={size,start:[0,size-1],goal:[size-1,0],walls:[],title,intro:chip?'Vedd fel a lila adatcsipet, majd juttasd Bitet a csillaghoz! Az ismétlésekkel kevesebb blokk is elég.':'Találd meg az átjárókat! Egy nyilat most többször is ismételhetsz egyetlen utasításblokkal.',note:chip?'A feltétel ellenőrzése is a program része: a célba érés önmagában nem elég, ha a csip még hiányzik.':'Az ismétlés ugyanazt a lépést többször futtatja. A → ×3 ugyanaz, mint három jobbra nyíl.'};
  grid.forEach((row,y)=>row.forEach((v,x)=>{if(v)level.walls.push([x,y]);}));
  if(chip){
    const direct=findRoute(level),onRoute=new Set([level.start.join(',')]),p=[...level.start];
    direct.forEach(k=>{p[0]+=DIRECTIONS[k].dx;p[1]+=DIRECTIONS[k].dy;onRoute.add(p.join(','));});
    const branches=[];grid.forEach((row,y)=>row.forEach((wall,x)=>{if(!wall&&!onRoute.has([x,y].join(','))){const point=[x,y];branches.push({point,distance:findRoute(level,level.start,point).length+findRoute(level,point,level.goal).length});}}));
    branches.sort((a,b)=>b.distance-a.distance);level.chip=branches.length?branches[0].point:[...level.start];
  }
  return level;
}
const ROBOT_LEVELS = {
 explorer:[
  {size:5,start:[0,2],goal:[3,2],walls:[[1,0],[3,0],[1,4],[3,4]],title:'Az első utasításaid',intro:'Kattints a nyilakra, és juttasd el Bitet a csillaghoz. Nem kell kódot írnod: minden nyíl egy lépés!',note:'Az algoritmus egy feladat megoldásának lépéseit jelenti. Mint egy recept: a sorrend számít.'},
  {size:5,start:[0,4],goal:[4,0],walls:[[1,4],[1,3],[3,2],[2,1]],title:'Kerüld meg az akadályt!',intro:'Bit pontosan azt teszi, amit kérsz. Tervezd meg az egész útvonalat, majd indítsd a programot!',note:'A gép nem találja ki, mire gondoltál. Ha mást csinál, mint tervezted, vizsgáld meg az utasításokat.'},
  {size:5,start:[0,4],goal:[4,0],walls:[[0,2],[1,2],[3,4],[3,3],[3,1],[4,1]],title:'Találd meg az átjárót!',intro:'Az utolsó pályán már neked kell megkeresned a jó irányt. A szürke mezők akadályok.',note:'Kipróbálod, megfigyeled, javítod. A fejlesztők is sokszor végigmennek ezen a körön.'}
 ],
 challenger:[maze(7,721,'A labirintus bejárata'),maze(7,164,'Gondolkodj ismétlésekben!'),maze(7,928,'A kanyarok mestere')],
 expert:[maze(9,87,'Adatmentő küldetés',true),maze(9,513,'A rejtett folyosó',true),maze(9,1029,'Bit utolsó kihívása',true)]
};
const TEST_SCENARIOS = {
 explorer:[
  {title:'A kedvezmény',kind:'coupon',label:'Kuponkód',inputType:'text',value:'',placeholder:'Próbáld ezt: DIÁK',task:'A DIÁK kupon 500 Ft kedvezményt ad a 2 000 Ft-os jegyből. A fizetendő ár így 1 500 Ft.',probes:['DIÁK'],options:['A helyes kuponnal is 2 000 Ft marad az ár.','A jegy ingyenes lett.','Az app helyesen működik.'],correct:0,explanation:'A várt ár 1 500 Ft, a tényleges 2 000 Ft. A kupon elfogadása önmagában nem bizonyítja, hogy a kedvezmény működik.'},
  {title:'Az üres név',kind:'name',label:'A neved',inputType:'text',value:'',placeholder:'Próbáld ki üresen!',task:'A jelentkezést csak valódi névvel szabad elküldeni. Üres vagy csak szóközökből álló névnél hibaüzenet kell.',probes:[''],options:['A gomb túl kicsi.','Név nélkül is sikeresnek jelzi a jelentkezést.','Nincs hiba.'],correct:1,explanation:'Az üres mező fontos teszteset. A tesztelő nem csak azt próbálja ki, amikor a felhasználó mindent szabályosan kitölt.'},
  {title:'A korhatár',kind:'age',label:'Életkor',inputType:'number',value:'14',task:'A programra 14 éves kortól lehet jelentkezni. Egy 14 éves jelentkezőt már el kell fogadni.',probes:['14'],options:['A 13 éveseket is elfogadja.','Mindenkit elfogad.','A 14 éves jelentkezőt is elutasítja.'],correct:2,explanation:'A 14 év egy határérték. A „nagyobb mint 14” és a „legalább 14” közti eltérés egyetlen jel, mégis más eredményt ad.'}
 ],
 challenger:[
  {title:'A mínuszos kosár',kind:'quantity',label:'Jegyek száma',inputType:'number',value:'2',task:'1–5 darab jegy vásárolható, darabonként 1 000 Ft-ért. A tartományon kívül hibaüzenet kell.',probes:['2','-1'],options:['Negatív darabszámból negatív végösszeget számol.','Két jegy ára nem 2 000 Ft.','Minden darabszámot elutasít.'],correct:0,explanation:'A 2 egy szabályos érték, a −1 egy érvénytelen. A negatív végösszeg jelzi, hogy a bemeneti ellenőrzés hiányzik.'},
  {title:'A válogatós kereső',kind:'search',label:'Keresés',inputType:'text',value:'Robot',task:'A keresőben a Robot és robot ugyanazt a „Robotépítő műhely” találatot kell hogy adja. Kis- és nagybetű ne számítson.',probes:['Robot','robot'],options:['Egyik keresés sem ad találatot.','A kisbetűs robot nem ad találatot.','Két különböző programot mutat.'],correct:1,explanation:'Az azonos jelentésű, eltérő alakú bemeneteket is érdemes ellenőrizni. Ez itt kis- és nagybetűk kezelési hibája.'},
  {title:'Pont nyolc karakter',kind:'length',label:'Felhasználónév',inputType:'text',value:'bit',task:'A felhasználónév 1–8 karakter hosszú lehet, tehát a 8 karakteres bitrobot még érvényes.',probes:['bit','bitrobot'],options:['Minden nevet elfogad.','A rövid nevet is elutasítja.','A pontosan 8 karakteres nevet már túl hosszúnak jelzi.'],correct:2,explanation:'A maximális megengedett hossz külön tesztet érdemel. A „legfeljebb nyolc” a nyolcat is tartalmazza.'}
 ],
 expert:[
  {title:'Az ingyenes szállítás',kind:'shipping',label:'Kosárérték (Ft)',inputType:'number',value:'9999',task:'10 000 Ft-tól a szállítás ingyenes. Alatta 990 Ft. Ellenőrizd a határ alatti, a pontos és a határ fölötti értéket!',probes:['9999','10000','10001'],options:['Pont 10 000 Ft-nál is felszámít 990 Ft-ot.','9 999 Ft-nál ingyenes a szállítás.','10 001 Ft-nál fizetős a szállítás.'],correct:0,explanation:'A határérték környékének három pontját tesztelted. A hiba csak pontosan 10 000 Ft-nál látszik.'},
  {title:'Belépés a klubba',kind:'range',label:'Életkor',inputType:'number',value:'16',task:'A klubba 14–18 évesek léphetnek be, a két szélső életkort is beleértve. A 13 és a 19 nem megengedett.',probes:['13','16','19'],options:['A 16 éveseket is elutasítja.','A tartomány alatti és feletti jelentkezőket is elfogadja.','Csak a 18 éveseket fogadja el.'],correct:1,explanation:'A hibás szabály VAGY kapcsolatot használ ÉS helyett. Az életkornak egyszerre legalább 14-nek és legfeljebb 18-nak kell lennie.'},
  {title:'Biztos, hogy hibás?',kind:'healthy',label:'Megjelenítendő név',inputType:'text',value:'',task:'Az app utasítsa el az üres és csak szóközös nevet, a Bit nevet pedig fogadja el. Ne találj ki hibát, ha az ellenőrzött esetek jól működnek!',probes:['','   ','Bit'],options:['Minden beírt nevet elutasít.','A szóközöket érvényes névnek veszi.','A három tesztelt esetben nincs eltérés a szabálytól.'],correct:2,explanation:'A jó tesztelő azt is megállapítja, ha a vizsgált esetek helyesen működnek. Ez nem jelenti azt, hogy minden lehetséges hibát kizártál.'}
 ]
};
const APP_TEMPLATES = [
 {id:'mood',name:'Hangulatjelző',icon:'spark',desc:'Egy jó szó pont akkor, amikor kell.',prompt:'Ha szomorú vagyok, az app bátorítson. Ha vidám, örüljön velem!',choices:[['happy','vidám 😊'],['sad','szomorú 😔']],correct:'sad',default:'happy',tests:[['happy','Vidám 😊'],['sad','Szomorú 😔']],question:'HA a hangulatom',then:'„Menni fog, lépésről lépésre! 💪”',otherwise:'„Szuper, csak így tovább! ✨”'},
 {id:'ticket',name:'Jegyárkalkulátor',icon:'bolt',desc:'A határérték most rajtad múlik.',prompt:'14 éves korig (a 14-et is beleértve) 1 000 Ft a jegy, felette 2 000 Ft.',choices:[['lt','kisebb mint 14'],['lte','legfeljebb 14'],['gt','nagyobb mint 14']],correct:'lte',default:'lt',tests:[['13','13 éves'],['14','14 éves'],['15','15 éves']],question:'HA az életkor',then:'1 000 Ft-os jegy',otherwise:'2 000 Ft-os jegy'},
 {id:'focus',name:'Fókuszbarát',icon:'clock',desc:'Kis logika, jobb tanulási ritmus.',prompt:'Legalább 25 perc fókusz után javasolj szünetet. Előtte jelezd, hogy még tart a fókuszidő.',choices:[['gt','több mint 25'],['gte','legalább 25'],['lte','legfeljebb 25']],correct:'gte',default:'gt',tests:[['24','24 perc'],['25','25 perc'],['26','26 perc']],question:'HA a fókuszidő',then:'„Jöhet egy rövid szünet! 🌿”',otherwise:'„Még egy kis fókusz! 🎯”'}
];
const QUIZ = [
 {q:'Mit jelent az algoritmus?',options:['Egy titkos jelszót.','Egy megoldás lépéseinek sorrendjét.','Egy számítógép márkáját.'],correct:1,why:'Egy recept vagy egy robot útvonala is algoritmus lehet: megmondja, mit milyen sorrendben tegyünk.'},
 {q:'Elsőre nem működik a programod. Mit teszel?',options:['Végignézem a lépéseket, és újra kipróbálom.','Biztosan nem nekem való a fejlesztés.','Véletlenszerűen átírok mindent.'],correct:0,why:'A hibakeresés a fejlesztés természetes része. Megfigyelésből és kisebb javításokból jutsz előre.'},
 {q:'Melyik a leghasznosabb hibajelentés?',options:['„Rossz az app.”','„Nem szeretem a színét.”','„Üres névvel elküldve is sikeresnek jelzi a jelentkezést.”'],correct:2,why:'A pontos leírás megmutatja a kiváltó lépést és a megfigyelt eredményt. Így más is meg tudja ismételni.'},
 {q:'Miért használunk ismétlést a programban?',options:['Hogy ugyanazt a lépést többször, rövidebben adhassuk meg.','Hogy lassabb legyen a gép.','Mert a gép elfelejti az utasításokat.'],correct:0,why:'A ciklus egy utasítást vagy egy egész utasítássort ismételhet. A robotjátékban a ×3 ugyanazt a nyilat háromszor futtatja.'},
 {q:'Csak egyedül dolgozik egy fejlesztő?',options:['Igen, a csapatmunka nem számít.','Nem, gyakran más fejlesztőkkel, tesztelőkkel és tervezőkkel dolgozik.','Csak a gépével beszél.'],correct:1,why:'Egy alkalmazás közös munka: az ötletek, a megvalósítás és az ellenőrzés folyamatosan találkoznak.'},
 {q:'Mire érdemes használni az AI által javasolt kódot?',options:['Ellenőrzés nélkül bemásolni.','Mindig elutasítani.','Megérteni, kipróbálni és ellenőrizni.'],correct:2,why:'Az AI adhat ötletet, de tévedhet. Az alapok segítenek megítélni, hogy a javaslat helyes és a célodhoz illik-e.'}
];
const DEBUG_PUZZLES = [
 {title:'A fordított sorrend',description:'Bitnek előbb a cipőt, aztán a kabátot kell felvennie, és csak utána indulhat ki. Melyik sorrend helyes?',code:['indulás()','cipő_fel()','kabát_fel()'],options:['indulás → cipő → kabát','cipő → kabát → indulás','kabát → indulás → cipő'],correct:1,why:'Az utasítások sorrendje meghatározza a működést. Az algoritmust előbb fejben is végig tudod játszani.'},
 {title:'Az egyetlen hiányzó jel',description:'A klub 14 éves kortól nyitott. A kód most ezt mondja: „HA életkor > 14”. Melyik javítás engedi be a 14 éveseket is?',code:['HA életkor > 14','  belépés_engedélyezve()'],options:['életkor < 14','életkor = 13','életkor ≥ 14'],correct:2,why:'A ≥ jelentése: nagyobb vagy egyenlő. Egy apró különbség a feltételben sok felhasználót érinthet.'},
 {title:'Sose ér véget?',description:'Egy játékban a pontszám 0-ról indul. Minden körben eggyel nő, és 3-nál meg kell állnia. Mi legyen az ismétlés feltétele?',code:['pont = 0','AMÍG ???','  pont = pont + 1'],options:['pont < 3','pont > 3','pont ≥ 0'],correct:0,why:'A „pont < 3” kezdetben igaz, majd 3-nál hamis lesz, ezért az ismétlés befejeződik. A „pont ≥ 0” soha nem állna le ebben a példában.'}
];
const GLOSSARY = [
 ['Algoritmus','alapok','Egy feladat megoldásának lépései, meghatározott sorrendben.','Mint amikor leírod a robot útját: fel, fel, jobbra.'],
 ['Program','alapok','A számítógép által követhető utasítások együttese.','A robotjáték nyilai együtt egy programot alkotnak.'],
 ['Változó','fejlesztés','Egy névvel ellátott hely, ahol egy adat értékét tároljuk.','A pontszám értéke lehet 0, majd egy találat után 1.'],
 ['Feltétel','fejlesztés','Egy eldönthető állítás, amelytől függ, mi történjen.','HA esik, AKKOR esernyőt viszek.'],
 ['Ciklus','fejlesztés','Egy lépés vagy lépéssor ismétlése.','Lépj jobbra háromszor, ahelyett hogy három külön nyilat írnál.'],
 ['Bug','tesztelés','Eltérés az elvárt és a tényleges működés között. Magyarul: szoftverhiba.','A kupon elfogadva, de az ár nem csökken.'],
 ['Teszteset','tesztelés','Egy konkrét próba a hozzá tartozó várt eredménnyel.','14 éves kor megadása → a 14+ program elfogadja.'],
 ['Határérték','tesztelés','Egy megengedett tartomány széle, amit külön is érdemes tesztelni.','A 14 éves kortól érvényes szabálynál 13, 14 és 15 kipróbálása.'],
 ['Frontend','fejlesztés','Az alkalmazás része, amelyet a felhasználó lát és kezel.','Az itt látható gombok, űrlapok és a robotpálya.'],
 ['Backend','fejlesztés','A háttérben működő logika és adatkezelés, gyakran szerveren.','Egy valódi jegyappban a foglalás ellenőrzése és mentése.'],
 ['Adatbázis','alapok','Rendszerezett adatok tárolására és lekérdezésére szolgáló rendszer.','Egy könyvtár könyvei, olvasói és kölcsönzései.'],
 ['Git','fejlesztés','Verziókezelő eszköz: segít követni a kód változásait és együtt dolgozni.','Megnézheted, melyik változtatás után jelent meg egy hiba.'],
 ['API','alapok','Szabályozott kapcsolat, amelyen két program adatot vagy műveletet kérhet egymástól.','Egy időjárás-app lekéri az aktuális hőmérsékletet.'],
 ['Automatizált teszt','tesztelés','Programmal végzett ellenőrzés, amelyet újra és újra le lehet futtatni.','Minden frissítés után ellenőrzi, hogy a kupon még mindig csökkenti-e az árat.'],
 ['Hozzáférhetőség','alapok','Úgy tervezünk, hogy eltérő képességű emberek is használhassák az alkalmazást.','Billentyűzettel működő gombok, olvasható kontraszt és feliratozott mezők.']
];
