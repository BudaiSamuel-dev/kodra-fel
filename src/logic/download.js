import { COLORS } from 'data/appTemplates'
import { DIFFICULTIES } from 'data/difficulties'
import { quizStatus, totalXP } from './xp'

export const escapeHTML = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export function downloadBlob(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Mi hiányzik még a kiadáshoz? Üres szöveg, ha az app kész.
export function appProblem(template, app) {
  if (!app.name.trim()) return 'Adj nevet az appodnak!'
  if (app.tests.length < template.tests.length) return 'Előbb próbáld ki az összes gombot az előnézetben!'
  if (app.rule !== template.correct)
    return `Még nem teljesül a feladat: ${template.prompt} Ellenőrizd a HA feltételt, javítsd, majd próbáld ki újra az összes esetet!`
  return ''
}

// A kész miniapp önálló HTML-fájlként, külső függőség nélkül.
export function miniappHTML(template, app) {
  const config = JSON.stringify({
    name: app.name,
    color: COLORS[app.color],
    id: template.id,
    rule: app.rule,
    tests: template.tests
  }).replace(/</g, '\\u003c')
  const name = escapeHTML(app.name)
  return `<!DOCTYPE html><html lang="hu"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name}</title><style>*{box-sizing:border-box}body{font-family:system-ui;background:#f4f7ee;color:#263a2a;min-height:100dvh;margin:0;display:grid;place-items:center;padding:20px}main{background:white;padding:35px;border-radius:25px;max-width:420px;width:100%;box-shadow:0 15px 60px #203c2512}h1{overflow-wrap:anywhere}p{line-height:1.7;color:#62715a}nav{display:flex;gap:10px;margin:25px 0}button{border:1px solid #bccdaa;background:var(--accent);border-radius:12px;padding:15px;flex:1;cursor:pointer;font:inherit}output{display:block;min-height:70px;padding:20px;background:var(--accent);border-radius:12px;line-height:1.7}small{display:block;margin-top:25px;color:#62715a}button:focus-visible{outline:3px solid #315a28;outline-offset:4px}</style><main><h1>${name}</h1><p>${escapeHTML(template.prompt)}</p><nav aria-label="Próbaértékek"></nav><output aria-live="polite">Válassz egy lehetőséget!</output><small>Készült a Kódra fel! tech-kalandban.</small></main><script>const c=${config};document.documentElement.style.setProperty('--accent',c.color);c.tests.forEach(([v,label])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{let result;if(c.id==='mood')result=v===c.rule?'Menni fog, lépésről lépésre! 💪':'Szuper, csak így tovább! ✨';else if(c.id==='ticket')result=Number(v)<=14?'1 000 Ft-os jegy':'2 000 Ft-os jegy';else result=Number(v)>=25?'Jöhet egy rövid szünet! 🌿':'Még egy kis fókusz! 🎯';document.querySelector('output').textContent=result};document.querySelector('nav').append(b)});</script></html>`
}

export function progressText(game) {
  const levels = DIFFICULTIES.map((d) => {
    const p = game.profiles[d.id]
    return `${d.name}: ${p.completed.length}/3 küldetés\n  Robotpályák: ${p.robotSolved.length}/3\n  Teszthelyzetek: ${p.testReports.length}/3`
  }).join('\n\n')
  return `KÓDRA FEL! – A TECH-KALANDOM

${levels}

Kódnyomozó: ${game.bonus.debug.length}/3
Tech radar: ${quizStatus(game).best ?? 0}/6 helyes válasz${quizStatus(game).passed ? '' : ' (a jelvényhez legalább 2 kell)'}
Összesen: ${totalXP(game)} XP

Ez egy játékos felfedezés összegzése, nem osztályzat vagy pályaalkalmassági eredmény.
Következő kérdésem a nyílt napon: Milyen saját projekteket készíthetek nálatok?
`
}
