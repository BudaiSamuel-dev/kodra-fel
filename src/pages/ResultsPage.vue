<!-- Egy szint mindhárom küldetésének teljesítése után. -->
<template>
  <GameShell :counting="false">
    <div class="completion-card">
      <div class="completion-icon"><AppIcon name="cup" /></div>
      <div class="eyebrow">{{ store.difficulty.name.toLocaleUpperCase('hu-HU') }} SZINT TELJESÍTVE</div>
      <h1>A jövő alkotója? Akár te.</h1>
      <p>
        Programoztál egy robotot, alkalmazást teszteltél és saját miniappot építettél. Nem kellett előre tudnod — elkezdted, és
        lépésről lépésre megtanultad.
      </p>
      <div class="earned-badges">
        <span class="earned-badge"><AppIcon name="code" />Logikus gondolkodó</span>
        <span class="earned-badge"><AppIcon name="bug" />Hibavadász</span>
        <span class="earned-badge"><AppIcon name="rocket" />Ötletgazda</span>
      </div>
      <div class="completion-actions">
        <router-link class="button primary" to="/szakma">Milyen lehet ezt tanulni?<AppIcon name="arrow" /></router-link>
        <button class="button outline" data-test="download-app" @click="downloadApp"><AppIcon name="down" />Saját app letöltése</button>
      </div>
    </div>

    <div class="reflection">
      <h2>Melyik pillanat volt a kedvenced?</h2>
      <p>Ez egy élmény, nem alkalmassági teszt. Az XP a felfedezést jelzi, nem osztályzat.</p>
      <div class="reflection-options">
        <button
          v-for="[value, label] in REFLECTIONS"
          :key="value"
          :data-value="value"
          :class="{ selected: store.profile.reflection === value }"
          :aria-pressed="store.profile.reflection === value"
          @click="store.profile.reflection = value"
        >
          {{ label }}
        </button>
      </div>
      <div id="reflection-feedback" role="status">
        <LearningNote v-if="store.profile.reflection">Kérdezd meg a nyílt napon: „Milyen saját projekteket készíthetek nálatok?”</LearningNote>
      </div>
    </div>

    <div class="next-adventure">
      <h2>Még tart a kíváncsiság?</h2>
      <div class="game-actions">
        <button
          v-for="d in otherDifficulties"
          :key="d.id"
          class="button secondary"
          :data-difficulty="d.id"
          @click="nextDifficulty(d.id)"
        >
          <AppIcon :name="d.icon" />{{ d.name }} szint
        </button>
        <button class="button secondary" @click="openBonus('debug')">Kódnyomozó<AppIcon name="arrow" /></button>
      </div>
    </div>

    <div class="result-actions">
      <router-link class="text-button" to="/">Vissza a felfedezéshez<AppIcon name="arrow" /></router-link>
      <button class="text-button" @click="openDialog('reset')">Új felfedező<AppIcon name="reset" /></button>
    </div>
  </GameShell>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { DIFFICULTIES } from 'data/difficulties'
import { useGameStore } from 'stores/game'
import { celebrate, openDialog } from 'src/composables/useUi'
import { useNavigation } from 'src/composables/useNavigation'
import { useAppDownload } from 'src/composables/useAppDownload'
import GameShell from 'components/game/GameShell.vue'
import LearningNote from 'components/game/LearningNote.vue'

const REFLECTIONS = [
  ['dev', 'Amikor Bit célba ért'],
  ['test', 'Amikor megtaláltam az eltérést'],
  ['both', 'Amikor működött a saját appom']
]

const store = useGameStore()
const router = useRouter()
const { start, openBonus } = useNavigation()
const downloadApp = useAppDownload()
const otherDifficulties = computed(() => DIFFICULTIES.filter((d) => d.id !== store.game.difficulty))

// Közvetlen link vagy szintváltás esetén: ha a szint még nincs kész, vissza a küldetésekhez.
onMounted(() => {
  if (store.profile.completed.length < 3) router.replace('/')
  else celebrate(35)
})

// A fejlécben másik szintet választva: ha az még nincs kész, vissza a főoldalra.
watch(
  () => store.game.difficulty,
  () => store.profile.completed.length < 3 && router.push('/')
)

function nextDifficulty(id) {
  store.setDifficulty(id)
  start()
}
</script>
