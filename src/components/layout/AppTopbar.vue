<template>
  <header class="topbar">
    <div class="topbar-left">
      <span class="live-dot"></span>PÁLYAORIENTÁCIÓS NAP <span class="topbar-separator">/</span><span class="topbar-sub">A jövőd itt kezdődik</span>
    </div>
    <div class="topbar-right">
      <span class="duration"><AppIcon name="clock" />5–10 perc</span>
      <span class="header-line"></span>
      <router-link class="xp-chip" to="/jelvenyek"><AppIcon name="bolt" /><span id="total-xp">{{ store.xp }} XP</span></router-link>
      <button
        class="theme-toggle icon-button"
        :aria-label="`${dark ? 'Világos' : 'Sötét'} megjelenés bekapcsolása`"
        @click="store.toggleTheme()"
      >
        <AppIcon :name="dark ? 'sun' : 'moon'" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from 'stores/game'

const store = useGameStore()
const dark = computed(() => store.game.theme === 'dark')
</script>
