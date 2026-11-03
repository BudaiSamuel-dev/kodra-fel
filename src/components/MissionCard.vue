<template>
  <button class="mission-card" :class="`card-${color}`" :data-mission="index">
    <div class="card-top">
      <span class="mission-icon"><AppIcon :name="icon" /></span>
      <span class="card-number">0{{ index + 1 }} <span>/</span> {{ role }}</span>
      <span v-if="done" class="complete-tick">✓</span>
    </div>
    <slot name="visual" />
    <h3>{{ title }}</h3>
    <p>{{ lines[0] }}<br />{{ lines[1] }}</p>
    <div class="card-bottom">
      <span><AppIcon name="clock" />{{ time }}<span class="level-dot"></span>{{ skill }}</span>
      <span class="card-arrow"><AppIcon name="arrow" /></span>
    </div>
  </button>
</template>

<script setup>
defineProps({
  index: { type: Number, required: true },
  color: { type: String, required: true },
  icon: { type: String, required: true },
  role: { type: String, required: true },
  title: { type: String, required: true },
  lines: { type: Array, required: true },
  time: { type: String, required: true },
  skill: { type: String, required: true },
  done: Boolean
})
</script>
