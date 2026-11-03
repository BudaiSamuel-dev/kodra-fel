<!-- Visszajelzés egy próbálkozás után. type: 'success' | 'error' | '' (semleges) -->
<template>
  <div class="feedback" :class="type">
    <strong>{{ title }}</strong>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  type: { type: String, default: '' },
  title: { type: String, required: true }
})
</script>
