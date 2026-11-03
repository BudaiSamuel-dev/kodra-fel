// Ékezet- és kisbetű-független keresés: „hatarertek” megtalálja a „Határérték”-et.
export const normalized = (s) => s.toLocaleLowerCase('hu-HU').normalize('NFD').replace(/\p{Diacritic}/gu, '')

export function searchGlossary(glossary, query, category = 'all') {
  const q = normalized(query.trim())
  return glossary.filter((entry) => (category === 'all' || entry[1] === category) && normalized(entry.join(' ')).includes(q))
}
