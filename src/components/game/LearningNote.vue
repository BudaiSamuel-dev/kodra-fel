<template>
  <div class="learning-note">
    <AppIcon name="light" />
    <span><strong v-if="title">{{ title }}</strong> <slot /></span>
  </div>
</template>

<script setup>
defineProps({ title: { type: String, default: '' } })
</script>
