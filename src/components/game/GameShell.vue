<!-- A küldetés- és bónuszoldalak közös kerete: vissza gomb, szintválasztó, időzítő és a három lépés sávja. -->
<template>
  <section id="game-view" aria-label="Küldetés">
    <div class="game-heading">
      <router-link class="back-link" to="/"><AppIcon name="left" />Vissza a felfedezéshez</router-link>
      <label v-if="!bonus" class="game-difficulty-label">
        Szint
        <select id="game-difficulty" aria-label="Játék nehézsége" :value="store.game.difficulty" @change="changeDifficulty">
          <option v-for="d in DIFFICULTIES" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
      </label>
      <span class="game-timer">
        <AppIcon name="clock" /><span id="timer">{{ timer }}</span><span class="timer-note">a te tempódban</span>
      </span>
    </div>
    <div v-if="!bonus" id="game-steps" class="game-steps">
      <router-link
        v-for="(label, i) in STEP_LABELS"
        :key="i"
        :to="missionPath(i)"
        class="game-step"
        :class="{ active: mission === i }"
        :data-mission="i"
        :data-short="label"
        :aria-current="mission === i ? 'step' : undefined"
      >
        <span class="step-num">{{ store.profile.completed.includes(i) ? '✓' : String(i + 1).padStart(2, '0') }}</span>
        <span>{{ label }}</span>
        <span class="step-xp">+{{ store.difficulty.xp }} XP</span>
      </router-link>
    </div>
    <div id="game-content">
      <slot />
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { DIFFICULTIES } from 'data/difficulties'
import { useGameStore } from 'stores/game'
import { toast, ui } from 'src/composables/useUi'
import { missionPath } from 'src/composables/useNavigation'

const props = defineProps({
  mission: { type: Number, default: -1 }, // -1: eredményoldal, nincs aktív lépés
  bonus: Boolean,
  counting: { type: Boolean, default: true } // fusson-e az időzítő
})

const STEP_LABELS = ['Fejlesztő', 'Tesztelő', 'Alkotó']
const store = useGameStore()

const timer = computed(() => {
  const s = store.profile.elapsed
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})

// Az időzítő csak akkor megy, ha a diák ténylegesen játszik (nem rejtett a lap, nincs nyitva ablak).
let interval
onMounted(() => {
  interval = setInterval(() => {
    if (props.counting && !document.hidden && !ui.dialog) store.tick()
  }, 1000)
})
onBeforeUnmount(() => clearInterval(interval))

function changeDifficulty(e) {
  store.setDifficulty(e.target.value)
  toast(`${store.difficulty.name} szint kiválasztva. Minden szint haladása külön megmarad.`)
}
</script>
