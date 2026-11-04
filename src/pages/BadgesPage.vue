<template>
  <section id="badges-view" aria-label="Jelvényeim">
    <div class="page-intro">
      <div class="eyebrow">A SAJÁT TECH-UTAD</div>
      <h1>Kis felismerések.<br /><span>Nagy gyűjtemény.</span></h1>
      <p>Minden jelvény egy kipróbált gondolkodásmód. Nincs ranglista: a tegnapi önmagadhoz képest haladsz.</p>
    </div>

    <div class="collection-overview">
      <div>
        <strong>{{ earnedCount }}<span> / {{ badges.length }}</span></strong><span>megszerzett jelvény</span>
      </div>
      <div>
        <strong>{{ store.xp }}<span> XP</span></strong><span>összegyűjtött tapasztalat</span>
      </div>
      <div>
        <strong>{{ finishedLevels }}<span> / 3</span></strong><span>teljesített nehézségi szint</span>
      </div>
    </div>

    <div class="badge-grid">
      <article v-for="badge in badges" :key="badge.key" class="badge-card" :class="badge.earned ? 'earned' : 'not-earned'">
        <span class="badge-emblem"><AppIcon :name="badge.icon" /><i v-if="badge.earned">✓</i></span>
        <span class="badge-tier">{{ badge.tier }}</span>
        <h2>{{ badge.name }}</h2>
        <p>{{ badge.desc }}</p>
        <span v-if="badge.earned" class="badge-status"><AppIcon name="check" />Megszerezve</span>
        <button v-else class="text-button" @click="badge.open">Kipróbálom<AppIcon name="arrow" /></button>
      </article>
    </div>

    <div class="result-actions">
      <button class="button secondary" data-test="export-progress" @click="exportProgress"><AppIcon name="down" />Kalandom mentése</button>
      <button class="text-button" @click="openDialog('reset')">Új felfedező<AppIcon name="reset" /></button>
    </div>
    <p class="collection-note">
      Az XP és a jelvények a játékban kipróbált feladatokat jelzik. Nem osztályzatok és nem pályaalkalmassági eredmények.
    </p>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { DIFFICULTIES } from 'data/difficulties'
import { downloadBlob, progressText } from 'logic/download'
import { quizStatus } from 'logic/xp'
import { useGameStore } from 'stores/game'
import { openDialog } from 'src/composables/useUi'
import { useNavigation } from 'src/composables/useNavigation'

const MISSION_BADGES = [
  ['code', 'Logikus gondolkodó', 'Három robotpálya megoldása.'],
  ['bug', 'Hibavadász', 'Három teszthelyzet megvizsgálása.'],
  ['rocket', 'Ötletgazda', 'Egy saját miniapp elkészítése.']
]

const store = useGameStore()
const { openMission, openBonus } = useNavigation()

// Szintenként 3 küldetésjelvény + 2 bónuszjelvény = 11
const badges = computed(() => [
  ...DIFFICULTIES.flatMap((d) =>
    MISSION_BADGES.map(([icon, name, desc], mission) => ({
      key: `${d.id}-${mission}`,
      icon,
      name,
      desc,
      tier: d.name,
      earned: store.game.profiles[d.id].completed.includes(mission),
      open: () => {
        store.setDifficulty(d.id)
        openMission(mission)
      }
    }))
  ),
  {
    key: 'debug',
    icon: 'code',
    name: 'Kódnyomozó',
    tier: 'Bónusz',
    desc: 'Három logikai hiba kijavítása.',
    earned: store.game.bonus.debug.length === 3,
    open: () => openBonus('debug')
  },
  {
    key: 'quiz',
    icon: 'spark',
    name: 'Tech radar',
    tier: 'Bónusz',
    desc: 'Hat kérdés, legalább 2 helyes válasszal.',
    earned: quizStatus(store.game).passed,
    open: () => openBonus('quiz')
  }
])

const earnedCount = computed(() => badges.value.filter((b) => b.earned).length)
const finishedLevels = computed(() => DIFFICULTIES.filter((d) => store.game.profiles[d.id].completed.length === 3).length)

const exportProgress = () => downloadBlob(progressText(store.game), 'tech-kalandom.txt', 'text/plain;charset=utf-8')
</script>
