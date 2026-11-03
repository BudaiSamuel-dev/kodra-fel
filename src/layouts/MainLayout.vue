<template>
  <SvgSprite />
  <a class="skip-link" href="#main">Ugrás a tartalomra</a>
  <AppSidebar />
  <div class="workspace">
    <AppTopbar />
    <main id="main" ref="main" tabindex="-1">
      <router-view :key="$route.path" />
    </main>
  </div>
  <InfoDialog />
  <div id="toast" :class="{ visible: ui.toastVisible }" role="status" aria-live="polite">{{ ui.toast }}</div>
</template>

<script setup>
import { nextTick, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from 'stores/game'
import { ui } from 'src/composables/useUi'
import SvgSprite from 'components/layout/SvgSprite.vue'
import AppSidebar from 'components/layout/AppSidebar.vue'
import AppTopbar from 'components/layout/AppTopbar.vue'
import InfoDialog from 'components/layout/InfoDialog.vue'

const store = useGameStore()
const main = ref(null)

watchEffect(() => {
  document.body.dataset.theme = store.game.theme
  document.querySelector('meta[name="theme-color"]').content = store.game.theme === 'dark' ? '#101b18' : '#f7f8f4'
})

// Oldalváltáskor a fókusz a címre kerül, hogy a képernyőolvasó is bemondja az új oldalt.
useRouter().afterEach(async () => {
  await nextTick()
  const h1 = main.value?.querySelector('h1')
  if (!h1) return
  h1.tabIndex = -1
  h1.focus({ preventScroll: true })
})
</script>
