<template>
  <GameShell :mission="mission">
    <CompletionCard v-if="completion" :mission="mission" :first="completion.first" />
    <RobotGame v-else-if="mission === 0" :key="store.game.difficulty" @complete="complete" />
    <TesterGame v-else-if="mission === 1" :key="store.game.difficulty" @complete="complete" />
    <div v-else class="completion-card"><h1>Hamarosan…</h1><p>Ez a küldetés még átírás alatt áll.</p></div>
  </GameShell>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from 'stores/game'
import { MISSION_SLUGS } from 'src/composables/useNavigation'
import { celebrate, focusHeading, scrollTop } from 'src/composables/useUi'
import GameShell from 'components/game/GameShell.vue'
import CompletionCard from 'components/game/CompletionCard.vue'
import RobotGame from 'components/robot/RobotGame.vue'
import TesterGame from 'components/tester/TesterGame.vue'

const route = useRoute()
const router = useRouter()
const store = useGameStore()
const mission = computed(() => MISSION_SLUGS.indexOf(route.params.mission))
const completion = ref(null)

// Szintváltáskor a küldetés elölről indul az új szint feladataival.
watch(() => store.game.difficulty, () => (completion.value = null))

function complete() {
  const first = store.completeMission(mission.value)
  if (store.profile.completed.length === 3) return router.push('/eredmeny')
  completion.value = { first }
  celebrate()
  scrollTop()
  focusHeading()
}
</script>
