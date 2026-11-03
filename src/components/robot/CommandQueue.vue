<!-- A diák programja: utasításblokkok sorrendben. Egy blokkra kattintva törölhető. -->
<template>
  <div class="queue-label">Utasítások sorrendben <span id="queue-count">{{ queue.length }} blokk · {{ steps }} lépés</span></div>
  <div id="command-queue" class="command-queue" aria-label="A robot programja">
    <button
      v-for="(command, i) in queue"
      :key="i"
      class="queue-item"
      :class="{ running: active === i }"
      :aria-label="`${i + 1}. blokk: ${DIRECTIONS[command.dir].label}, ${command.repeat} alkalommal. Törlés.`"
      :disabled="disabled"
      @click="$emit('remove', i)"
    >
      <span>{{ i + 1 }}.</span><AppIcon :name="DIRECTIONS[command.dir].icon" /><b v-if="command.repeat > 1">×{{ command.repeat }}</b>
    </button>
    <span v-if="!queue.length" class="queue-empty">A programod itt áll össze. Válaszd az első irányt!</span>
  </div>
</template>

<script setup>
import { DIRECTIONS } from 'logic/directions'

defineProps({
  queue: { type: Array, required: true },
  steps: { type: Number, required: true },
  active: { type: Number, default: -1 },
  disabled: Boolean
})
defineEmits(['remove'])
</script>
