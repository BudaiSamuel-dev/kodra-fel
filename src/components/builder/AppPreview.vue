<!-- Telefonos élő előnézet: a diák itt próbálja ki a miniapp szabályát. -->
<template>
  <div class="game-panel preview-panel">
    <div class="panel-heading">
      <h2>Élő előnézet</h2>
      <span class="panel-tag"><span></span>Azonnal változik</span>
    </div>
    <div id="phone-preview" class="phone-preview" :style="{ '--app-color': COLORS[app.color] }">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <div class="phone-logo"><AppIcon :name="template.icon" /></div>
        <h3 id="phone-title">{{ app.name || 'A te appod' }}</h3>
        <p>{{ QUESTIONS[template.id] }}</p>
        <div class="mood-buttons">
          <button
            v-for="[value, label] in template.tests"
            :key="value"
            class="mood-button"
            :class="{ numeric: template.id !== 'mood', active: active === value }"
            :data-value="value"
            :aria-label="`${label} kipróbálása`"
            :aria-pressed="active === value"
            @click="$emit('test', value)"
          >
            {{ template.id === 'mood' ? (value === 'happy' ? '😊' : '😔') : label }}
          </button>
        </div>
        <div id="mood-output" class="mood-output" role="status" aria-live="polite">{{ output }}</div>
      </div>
    </div>
    <p class="preview-caption">Minden megadott esetet próbálj ki a kiadás előtt!</p>
    <div class="miniapp-fact">
      <AppIcon name="code" />Egy feltételt állítasz be. A valódi programok is ilyen kis döntésekből épülnek.
    </div>
  </div>
</template>

<script setup>
import { COLORS } from 'data/appTemplates'

defineProps({
  template: { type: Object, required: true },
  app: { type: Object, required: true },
  active: { type: String, default: null }, // az utoljára kipróbált érték
  output: { type: String, required: true }
})
defineEmits(['test'])

const QUESTIONS = { mood: 'Ma hogy érzed magad?', ticket: 'Válassz életkort!', focus: 'Mennyi ideje fókuszálsz?' }
</script>
