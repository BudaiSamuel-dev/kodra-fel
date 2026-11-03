<template>
  <div class="difficulty-grid" role="group" aria-label="Nehézségi szint">
    <button
      v-for="d in DIFFICULTIES"
      :key="d.id"
      class="difficulty-card"
      :class="{ selected: store.game.difficulty === d.id }"
      :data-difficulty="d.id"
      :aria-pressed="store.game.difficulty === d.id"
      @click="choose(d.id)"
    >
      <span class="difficulty-icon"><AppIcon :name="d.icon" /></span>
      <span class="difficulty-body">
        <span class="difficulty-tag">{{ d.tag }}</span>
        <strong>{{ d.name }}<small>LVL {{ d.level }}</small></strong>
        <span>{{ d.desc }}</span>
      </span>
      <span class="difficulty-check">{{ store.game.difficulty === d.id ? '✓' : d.level }}</span>
      <span class="difficulty-track">{{ store.game.profiles[d.id].completed.length }} / 3 küldetés</span>
    </button>
  </div>
</template>

<script setup>
import { DIFFICULTIES } from 'data/difficulties'
import { useGameStore } from 'stores/game'
import { toast } from 'src/composables/useUi'

const store = useGameStore()

function choose(id) {
  store.setDifficulty(id)
  toast(`${store.difficulty.name} szint kiválasztva. Minden szint haladása külön megmarad.`)
}
</script>
