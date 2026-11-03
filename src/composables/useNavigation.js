import { useRouter } from 'vue-router'
import { useGameStore } from 'stores/game'

// A három küldetés sorrendben: 0 fejlesztő, 1 tesztelő, 2 alkotó.
export const MISSION_SLUGS = ['robot', 'teszt', 'alkoto']
export const missionPath = (n) => `/kuldetes/${MISSION_SLUGS[n]}`
// A főoldal küldetés-szekciója; a „Küldetések” menüpont ide visz
export const MISSIONS_HASH = '#kuldetesek'
export const BONUS_SLUGS = { debug: 'kodnyomozo', quiz: 'techradar' }

export function useNavigation() {
  const router = useRouter()
  const store = useGameStore()
  return {
    // Az első még nem teljesített küldetés, vagy ha mind kész, az eredmények.
    start() {
      const next = [0, 1, 2].find((i) => !store.profile.completed.includes(i))
      router.push(next === undefined ? '/eredmeny' : missionPath(next))
    },
    openMission: (n) => router.push(missionPath(n)),
    openBonus: (kind) => router.push(`/bonusz/${BONUS_SLUGS[kind]}`)
  }
}
