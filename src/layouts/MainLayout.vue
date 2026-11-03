<template>
  <SvgSprite />
  <a class="skip-link" href="#main">Ugrás a tartalomra</a>
  <AppSidebar />
  <div class="workspace">
    <AppTopbar />
    <main id="main" tabindex="-1">
      <router-view :key="$route.path" />
    </main>
  </div>
  <InfoDialog />
  <div id="toast" :class="{ visible: ui.toastVisible }" role="status" aria-live="polite">{{ ui.toast }}</div>
</template>

<script setup>
import { watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from 'stores/game'
import { focusHeading, ui } from 'src/composables/useUi'
import SvgSprite from 'components/layout/SvgSprite.vue'
import AppSidebar from 'components/layout/AppSidebar.vue'
import AppTopbar from 'components/layout/AppTopbar.vue'
import InfoDialog from 'components/layout/InfoDialog.vue'

const store = useGameStore()

watchEffect(() => {
  document.body.dataset.theme = store.game.theme
  document.querySelector('meta[name="theme-color"]').content = store.game.theme === 'dark' ? '#101b18' : '#f7f8f4'
})

// Oldalváltáskor a fókusz a címre kerül, hogy a képernyőolvasó is bemondja az új oldalt.
useRouter().afterEach(focusHeading)
</script>
