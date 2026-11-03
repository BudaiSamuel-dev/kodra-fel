<template>
  <div id="home-view">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <div class="eyebrow"><span></span>BELÉPÉS A KULISSZÁK MÖGÉ // 0 ELŐISMERET</div>
        <h1 id="hero-title">
          Válts játékosból<br /><span>alkotóvá.</span><span class="title-spark" aria-hidden="true">✳</span>
        </h1>
        <p>
          Irányíts robotot. Vadássz hibákra. Építs saját appot.<br />
          Fedezd fel a fejlesztés és tesztelés világát —<br class="desktop-br" />
          a következő nagy ötlet lehet a tiéd.
        </p>
        <div class="hero-buttons">
          <button id="start-button" class="button primary" @click="start">{{ startLabel }}<AppIcon name="arrow" /></button>
          <button class="text-button" data-test="how" @click="openDialog('how')">Hogyan működik?<AppIcon name="arrow" /></button>
        </div>
        <div class="hero-note">
          <span class="mini-check"><AppIcon name="check" /></span>3 szint · saját tempó · végtelen próbálkozás
        </div>
      </div>
      <HeroArt />
    </section>

    <div class="lab-stats" aria-label="Felfedezhető tartalmak">
      <span><strong>09</strong> robotpálya</span><span><strong>09</strong> tesztelési helyzet</span>
      <span><strong>03</strong> miniapp</span><span><strong>02</strong> bónuszjáték</span>
    </div>

    <section class="difficulty-section" aria-labelledby="difficulty-title">
      <div class="section-heading">
        <div>
          <div class="eyebrow small">TE VÁLASZTOD A TEMPÓT</div>
          <h2 id="difficulty-title">Mennyire csavarjuk fel?</h2>
        </div>
        <span class="difficulty-note">Bármikor válthatsz. A haladásod megmarad.</span>
      </div>
      <DifficultyPicker />
    </section>

    <section id="missions" class="mission-section" aria-labelledby="missions-title">
      <div class="section-heading">
        <div>
          <div class="eyebrow small">PRÓBÁLD KI MAGAD</div>
          <h2 id="missions-title">A következő lépés a tiéd.</h2>
        </div>
        <span class="progress-pill">
          <span class="progress-ring" :style="{ background: `conic-gradient(#9dcf66 ${(done / 3) * 360}deg, transparent 0)` }"></span>
          <span>{{ store.difficulty.name }} · {{ done }} / 3 teljesítve</span>
        </span>
      </div>
      <div class="mission-cards">
        <MissionCard
          v-for="(card, i) in MISSION_CARDS"
          :key="i"
          v-bind="card"
          :index="i"
          :done="store.profile.completed.includes(i)"
          @click="openMission(i)"
        >
          <template #visual>
            <div v-if="i === 0" class="card-visual visual-code" aria-hidden="true">
              <span class="command-chip">↑ előre</span><span class="command-chip">→ jobbra</span>
              <span class="command-chip small-play"><AppIcon name="play" /></span><span class="visual-dots">···</span>
            </div>
            <div v-else-if="i === 1" class="card-visual visual-bug" aria-hidden="true">
              <div class="test-line"><span></span><i class="test-check">✓</i></div>
              <div class="test-line"><span></span><i class="test-error">!</i></div>
              <div class="test-line"><span></span><i class="test-check">✓</i></div>
              <span class="bug-magnifier"><AppIcon name="bug" /></span>
            </div>
            <div v-else class="card-visual visual-build" aria-hidden="true">
              <div class="mini-app">
                <div class="mini-app-dots">● ● ●</div>
                <div class="mini-app-content"><span>✦</span><div><i></i><i></i></div></div>
                <span class="mini-app-button"></span>
              </div>
              <span class="build-spark">✳</span>
              <span class="build-cursor">
                <svg viewBox="0 0 32 38" aria-hidden="true">
                  <path d="M5 3v27l7-7 6 12 6-3-6-11h10L5 3Z" fill="currentColor" stroke="#fff" stroke-width="2" />
                </svg>
              </span>
            </div>
          </template>
        </MissionCard>
      </div>
    </section>

    <section class="bonus-section" aria-labelledby="bonus-title">
      <div class="section-heading">
        <div>
          <div class="eyebrow small">MÉG EGY KÖR?</div>
          <h2 id="bonus-title">Extra pályák a kíváncsiaknak.</h2>
        </div>
        <span class="bonus-note">Opcionális · az alapjátékon túl</span>
      </div>
      <div class="bonus-grid">
        <button class="bonus-card debug-bonus" data-bonus="debug" @click="openBonus('debug')">
          <span class="bonus-art" aria-hidden="true">&lt;<span>/</span>&gt;</span>
          <span class="bonus-content">
            <span class="eyebrow">KÓDNYOMOZÓ · 2–3 PERC</span>
            <h3>Egy apró hiba.<br />Egy nagy felismerés.</h3>
            <span>Javítsd ki a sorrendet és a feltételeket!<br />3 rövid fejtörő, előismeret nélkül.</span>
            <span class="bonus-cta">Megfejtem <AppIcon name="arrow" /><span class="xp-reward">+120 XP</span></span>
          </span>
        </button>
        <button class="bonus-card quiz-bonus" data-bonus="quiz" @click="openBonus('quiz')">
          <span class="bonus-art" aria-hidden="true">?</span>
          <span class="bonus-content">
            <span class="eyebrow">TECH RADAR · 2–3 PERC</span>
            <h3>Már most többet<br />tudsz, mint hinnéd.</h3>
            <span>6 kérdés a tech világából.<br />Minden válasz mögött egy új ötlet.</span>
            <span class="bonus-cta">Kipróbálom <AppIcon name="arrow" /><span class="xp-reward">+120 XP</span></span>
          </span>
        </button>
      </div>
    </section>

    <section class="knowledge-teaser">
      <span class="teaser-icon"><AppIcon name="book" /></span>
      <div>
        <span class="eyebrow">NEM KELL MINDENT FEJBŐL TUDNOD</span>
        <h2>Bug? Ciklus? Frontend?<br />Mindjárt érteni fogod.</h2>
        <p>15 fogalom, hétköznapi példák és egy szakma, ami több a kódolásnál.</p>
      </div>
      <router-link class="button secondary" to="/tudastar">Irány a tudástár<AppIcon name="arrow" /></router-link>
    </section>

    <section class="bottom-banner">
      <div class="banner-icon"><AppIcon name="light" /></div>
      <div>
        <h3>Nem kell tudnod, mivel kezdj. Elég, ha elkezded.</h3>
        <p>Itt szabad próbálkozni. A hibák is a kaland részei.</p>
      </div>
      <router-link class="text-button" to="/szakma">Ismerd meg a szakmát<AppIcon name="arrow" /></router-link>
    </section>

    <footer>
      <span>kódra fel! <span class="footer-dot">·</span> A jövőt valakinek meg kell alkotnia.</span>
      <span>Akár neked. <AppIcon name="spark" /></span>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from 'stores/game'
import { openDialog } from 'src/composables/useUi'
import { useNavigation } from 'src/composables/useNavigation'
import DifficultyPicker from 'components/DifficultyPicker.vue'
import MissionCard from 'components/MissionCard.vue'
import HeroArt from 'components/HeroArt.vue'

const store = useGameStore()
const { start, openMission, openBonus } = useNavigation()
const done = computed(() => store.profile.completed.length)
const startLabel = computed(() =>
  done.value === 3 ? 'Eredmények megtekintése' : store.profile.elapsed > 0 ? 'Folytatom a kalandot' : 'Induljon a kaland'
)

const MISSION_CARDS = [
  { color: 'green', icon: 'code', role: 'FEJLESZTŐ', title: 'Tanítsd be a robotot!', lines: ['Te tervezed az útvonalat.', 'A robot követi az utasításaidat.'], time: '2–3 perc', skill: 'Logika' },
  { color: 'peach', icon: 'bug', role: 'TESZTELŐ', title: 'Kapd el a hibát!', lines: ['Valami nem stimmel az appban.', 'A te szemed kiszúrja?'], time: '2–3 perc', skill: 'Figyelem' },
  { color: 'purple', icon: 'rocket', role: 'ALKOTÓ', title: 'Ötletből miniapp.', lines: ['Egy jó ötlet, néhány döntés.', 'És már működik is!'], time: '1–2 perc', skill: 'Kreativitás' }
]
</script>
