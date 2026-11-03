<template>
  <div class="game-title-row">
    <div class="game-title">
      <div class="eyebrow">{{ label }}</div>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>
    <span v-if="progress" class="sublevel-pill">{{ progress }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  progress: { type: String, default: '' }
})
</script>
