<!-- Próbanapló: a legutóbbi 7 kipróbált bemenet és az app válasza. -->
<template>
  <div class="test-history">
    <h3>Próbanapló <span id="test-history-count">{{ history.length }} próba</span></h3>
    <div id="test-history">
      <div v-for="(entry, i) in history.slice(-7)" :key="history.length - 7 + i" class="history-entry">
        <code>{{ probeLabel(entry.input) }}</code><span>{{ entry.output }}</span>
      </div>
      <p v-if="!history.length">Minden kipróbált érték itt jelenik meg.</p>
    </div>
  </div>
</template>

<script setup>
import { probeLabel } from 'logic/testOutput'

defineProps({ history: { type: Array, required: true } })
</script>
