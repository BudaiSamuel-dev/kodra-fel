<!-- Egy küldetés teljesítése után megjelenő jelvénykártya. -->
<template>
  <div class="completion-card">
    <div class="completion-icon"><AppIcon :name="BADGES[mission].icon" /></div>
    <div class="eyebrow">{{ store.difficulty.name.toLocaleUpperCase('hu-HU') }} · {{ store.profile.completed.length }} / 3 KÜLDETÉS</div>
    <h1>{{ BADGES[mission].title }} jelvény megszerezve!</h1>
    <p>{{ BADGES[mission].text }}</p>
    <span class="earned-xp">{{ first ? '+' : '' }}{{ store.difficulty.xp }} XP {{ first ? 'megszerezve' : 'már megszerezve' }}</span>
    <div class="completion-actions">
      <button v-if="nextMission !== undefined" class="button primary" @click="openMission(nextMission)">
        Következő küldetés<AppIcon name="arrow" />
      </button>
      <button v-if="mission === 2" class="button outline" data-test="download-app" @click="$emit('download')">
        <AppIcon name="down" />Saját app letöltése
      </button>
    </div>
  </div>
  <div class="result-actions">
    <router-link class="text-button" to="/">Vissza a felfedezéshez<AppIcon name="arrow" /></router-link>
    <router-link class="text-button" to="/jelvenyek">Jelvényeim<AppIcon name="cup" /></router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from 'stores/game'
import { useNavigation } from 'src/composables/useNavigation'

defineProps({
  mission: { type: Number, required: true },
  first: Boolean
})
defineEmits(['download'])

const BADGES = [
  {
    icon: 'code',
    title: 'Fejlesztői',
    text: 'Lépésekre bontottál egy feladatot, megírtad az utasításokat, és kipróbáltad a megoldásodat. Ezt hívjuk fejlesztői gondolkodásnak.'
  },
  {
    icon: 'bug',
    title: 'Tesztelői',
    text: 'Szabályokat ellenőriztél, teszteket futtattál és pontos megállapításokat tettél. A részletekre figyelő szemeddel jobbá tetted volna az appot.'
  },
  {
    icon: 'rocket',
    title: 'Alkotói',
    text: 'Saját stílust és működési szabályt adtál egy miniappnak, majd teszteléssel ellenőrizted a megoldást. Az appod most letölthető!'
  }
]

const store = useGameStore()
const { openMission } = useNavigation()
const nextMission = computed(() => [0, 1, 2].find((i) => !store.profile.completed.includes(i)))
</script>
