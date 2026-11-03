// A miniapp válasza egy tesztértékre a diák által választott szabállyal.
export function appResult(templateId, rule, value) {
  if (templateId === 'mood') return value === rule ? 'Menni fog, lépésről lépésre! 💪' : 'Szuper, csak így tovább! ✨'
  const n = Number(value)
  if (templateId === 'ticket') {
    const yes = rule === 'lt' ? n < 14 : rule === 'lte' ? n <= 14 : n > 14
    return yes ? '1 000 Ft-os jegy' : '2 000 Ft-os jegy'
  }
  const yes = rule === 'gt' ? n > 25 : rule === 'gte' ? n >= 25 : n <= 25
  return yes ? 'Jöhet egy rövid szünet! 🌿' : 'Még egy kis fókusz! 🎯'
}
