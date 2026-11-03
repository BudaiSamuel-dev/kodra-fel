<template>
  <GameShell :mission="mission">
    <CompletionCard v-if="completion" :mission="mission" :first="completion.first" @download="downloadApp" />
    <RobotGame v-else-if="mission === 0" :key="store.game.difficulty" @complete="complete" />
    <TesterGame v-else-if="mission === 1" :key="store.game.difficulty" @complete="complete" />
    <AppBuilder v-else-if="mission === 2" :key="store.game.difficulty" @complete="complete" />
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
import AppBuilder from 'components/builder/AppBuilder.vue'
import { useAppDownload } from 'src/composables/useAppDownload'

const route = useRoute()
const router = useRouter()
const store = useGameStore()
const mission = computed(() => MISSION_SLUGS.indexOf(route.params.mission))
const completion = ref(null)
const downloadApp = useAppDownload()

// Szintváltáskor a küldetés elölről indul az új szint feladataival.
watch(() => store.game.difficulty, () => (completion.value = null))

function complete() {
  const first = store.completeMission(mission.value)
  // Az eredményoldal még átírás alatt áll; amíg nincs meg, a jelvénykártya jelenik meg.
  if (store.profile.completed.length === 3 && router.hasRoute('results')) return router.push('/eredmeny')
  completion.value = { first }
  celebrate()
  scrollTop()
  focusHeading()
}
</script>
