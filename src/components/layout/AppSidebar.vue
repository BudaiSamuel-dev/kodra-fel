<template>
  <aside class="sidebar" aria-label="Oldalsáv">
    <router-link to="/" class="brand" aria-label="Kódra fel! Főoldal">
      <span class="brand-icon">&gt;_</span><span>kódra fel<span class="brand-dot">!</span></span>
    </router-link>
    <div class="sidebar-label">TECH LAB / 3.0</div>
    <nav class="main-nav" aria-label="Fő navigáció">
      <button class="nav-item" :class="{ active: section === 'home' }" @click="goHome">
        <AppIcon name="grid" />Felfedezés<span class="nav-dot"></span>
      </button>
      <button class="nav-item" :class="{ active: section === 'missions' }" @click="goMissions">
        <AppIcon name="flag" />Küldetések<span class="nav-count">{{ store.profile.completed.length === 3 ? '✓' : '3' }}</span>
      </button>
      <button class="nav-item" :class="{ active: section === 'profession' }" @click="router.push('/szakma')">
        <AppIcon name="people" />A szakmáról
      </button>
      <button class="nav-item" :class="{ active: section === 'learn' }" @click="router.push('/tudastar')">
        <AppIcon name="book" />Tudástár<span class="new-mark">ÚJ</span>
      </button>
      <button class="nav-item" :class="{ active: section === 'badges' }" @click="router.push('/jelvenyek')">
        <AppIcon name="cup" />Jelvényeim
      </button>
    </nav>
    <div class="sidebar-bottom">
      <div class="player-card">
        <div class="player-rank">
          <span class="player-emblem"><AppIcon name="bolt" /></span>
          <div>
            <span class="player-caption">A TE SZINTED</span><strong>{{ store.rank.name }}</strong>
          </div>
        </div>
        <div class="xp-bar"><span :style="{ width: store.rank.progress + '%' }"></span></div>
        <div class="xp-caption">
          <span>{{ store.xp }} / {{ store.rank.next }} XP</span>
          <button aria-label="Jelvényeim megtekintése" @click="router.push('/jelvenyek')"><AppIcon name="arrow" /></button>
        </div>
      </div>
      <button class="nav-item help-link" @click="openDialog('help')"><AppIcon name="help" />Egy kis segítség</button>
      <div class="sidebar-foot">Pályaorientáció, újragondolva.</div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from 'stores/game'
import { openDialog, prefersReducedMotion } from 'src/composables/useUi'
import { MISSIONS_HASH } from 'src/composables/useNavigation'

const store = useGameStore()
const route = useRoute()
const router = useRouter()

// A küldetés-, eredmény- és bónuszoldalak a "Küldetések" menüponthoz tartoznak,
// ahogy a főoldal küldetés-szekciója is (/#kuldetesek).
const section = computed(() => {
  if (route.name === 'home' && route.hash === MISSIONS_HASH) return 'missions'
  return route.meta.section ?? route.name
})

const behavior = () => (prefersReducedMotion() ? 'instant' : 'smooth')

// Ha már ott vagyunk, a router nem navigál újra (és nem görget), ezért kézzel görgetünk.
function goMissions() {
  if (route.name === 'home' && route.hash === MISSIONS_HASH)
    document.getElementById(MISSIONS_HASH.slice(1))?.scrollIntoView({ behavior: behavior() })
  else router.push({ path: '/', hash: MISSIONS_HASH })
}

function goHome() {
  if (route.name === 'home' && !route.hash) window.scrollTo({ top: 0, behavior: behavior() })
  else router.push('/')
}
</script>
