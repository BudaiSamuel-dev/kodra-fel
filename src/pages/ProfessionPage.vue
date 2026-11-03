<template>
  <section id="profession-view" aria-labelledby="profession-title">
    <router-link class="back-link" to="/"><AppIcon name="left" />Vissza a felfedezéshez</router-link>
    <div class="profession-intro">
      <div class="eyebrow">A KÉPERNYŐ MÖGÖTT</div>
      <h1 id="profession-title">Egy ötlet.<br /><span>Két szuperképesség.</span></h1>
      <p>A szoftverfejlesztő és -tesztelő technikus képzésben mindkét gondolkodásmódot megismerheted.</p>
    </div>

    <div class="profession-grid">
      <article v-for="card in PROFESSION_CARDS" :key="card.role" class="profession-card" :class="{ peach: card.role === 'test' }">
        <span class="mission-icon"><AppIcon :name="card.icon" /></span>
        <span class="eyebrow small">{{ card.label }}</span>
        <h2>{{ card.question }}</h2>
        <p>{{ card.text }}</p>
        <h3>Ezt már most is használod:</h3>
        <ul>
          <li v-for="skill in card.skills" :key="skill">{{ skill }}</li>
        </ul>
        <button class="button" :class="card.role === 'dev' ? 'primary' : 'dark'" :data-mission="card.mission" @click="openMission(card.mission)">
          Kipróbálom<AppIcon name="arrow" />
        </button>
      </article>
    </div>

    <div class="learning-panel">
      <h2>Mit tanulhatsz a technikumban?</h2>
      <div>
        <span v-for="[icon, label] in SCHOOL_TOPICS" :key="label"><AppIcon :name="icon" />{{ label }}</span>
      </div>
      <p>A pontos tantervről, felvételiről és iskolai projektekről kérdezd a pályaorientációs nap tanárait és diákjait!</p>
    </div>

    <div id="profession-extras">
      <section class="day-section">
        <div class="section-heading">
          <div>
            <div class="eyebrow small">ILLUSZTRATÍV MUNKANAP</div>
            <h2>Egy app. Két nézőpont.</h2>
          </div>
          <div class="filter-buttons" role="group" aria-label="Munkanap szerepköre">
            <button
              v-for="[role, icon, label] in ROLES"
              :key="role"
              :data-role="role"
              :class="{ selected: dayRole === role }"
              :aria-pressed="dayRole === role"
              @click="dayRole = role"
            >
              <AppIcon :name="icon" />{{ label }}
            </button>
          </div>
        </div>
        <div id="day-timeline" class="day-timeline">
          <article v-for="[time, title, desc] in WORKDAYS[dayRole]" :key="time">
            <time>{{ time }}</time><span class="timeline-dot"></span>
            <div>
              <h3>{{ title }}</h3>
              <p>{{ desc }}</p>
            </div>
          </article>
        </div>
        <p class="section-note">Szemléltető példa, nem egy konkrét munkahely napirendje. A feladatok és szerepek csapatonként változnak.</p>
      </section>

      <section class="learning-roadmap">
        <div class="eyebrow small">AMIT LÉPÉSRŐL LÉPÉSRE FELÉPÍTHETSZ</div>
        <h2>Nem készen kell érkezned.</h2>
        <div class="roadmap-grid">
          <article v-for="[n, title, text] in ROADMAP" :key="n">
            <span>{{ n }}</span>
            <h3>{{ title }}</h3>
            <p>{{ text }}</p>
          </article>
        </div>
      </section>

      <section class="project-examples">
        <div class="section-heading">
          <div>
            <div class="eyebrow small">ILYEN ÖTLETEKBŐL LEHET PROJEKT</div>
            <h2>Olyasmit építhetsz, amit használnál is.</h2>
          </div>
        </div>
        <div class="project-grid">
          <article v-for="[icon, title, text] in PROJECT_IDEAS" :key="title">
            <AppIcon :name="icon" />
            <h3>{{ title }}</h3>
            <p>{{ text }}</p>
          </article>
        </div>
      </section>

      <section class="career-faq">
        <div class="eyebrow small">AMIT SOKAN MEGKÉRDEZNEK</div>
        <h2>Beszéljünk róla őszintén.</h2>
        <details v-for="[question, answer] in FAQ" :key="question">
          <summary>{{ question }}<span aria-hidden="true">+</span></summary>
          <p>{{ answer }}</p>
        </details>
      </section>

      <div class="learning-panel">
        <h2>A kíváncsiságodat már most továbbviheted.</h2>
        <p>
          Keress egy valódi iskolai projektet a bemutatókon, és kérdezd meg a készítőit, hogyan kezdték. A tanterv, az óraszám és
          a felvételi intézményenként eltérhet.
        </p>
        <div class="game-actions" style="margin-top: 20px">
          <button class="button primary" @click="start">Kipróbálom magam<AppIcon name="arrow" /></button>
          <router-link class="button secondary" to="/tudastar"><AppIcon name="book" />Fogalmak érthetően</router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { FAQ, PROFESSION_CARDS, PROJECT_IDEAS, ROADMAP, SCHOOL_TOPICS, WORKDAYS } from 'data/profession'
import { useNavigation } from 'src/composables/useNavigation'

const { start, openMission } = useNavigation()
const dayRole = ref('dev')
const ROLES = [
  ['dev', 'code', 'Fejlesztőként'],
  ['test', 'bug', 'Tesztelőként']
]
</script>
