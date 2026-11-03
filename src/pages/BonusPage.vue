<template>
  <GameShell bonus>
    <BonusGame :kind="kind" />
  </GameShell>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { BONUS_SLUGS } from 'src/composables/useNavigation'
import GameShell from 'components/game/GameShell.vue'
import BonusGame from 'components/bonus/BonusGame.vue'

const route = useRoute()
const kind = computed(() => Object.keys(BONUS_SLUGS).find((k) => BONUS_SLUGS[k] === route.params.kind))
</script>
