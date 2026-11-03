<template>
  <section id="learn-view" aria-label="Tudástár">
    <div class="page-intro">
      <div class="eyebrow">TUDÁSTÁR / TECH NYELVEN, EMBERIÜL</div>
      <h1>A nagy szavak mögött<br /><span>egyszerű ötletek vannak.</span></h1>
      <p>Nem szótárat kell bemagolnod. Kapcsolj egy új fogalmat valamihez, amit már ismersz!</p>
    </div>

    <div class="glossary-toolbar">
      <label class="search-field">
        <AppIcon name="book" /><span class="sr-only">Fogalom vagy példa keresése</span>
        <input id="glossary-search" ref="search" v-model="query" type="search" placeholder="Keress rá: pl. bug, robot, feltétel…" autocomplete="off" />
      </label>
      <div class="filter-buttons" role="group" aria-label="Fogalmak szűrése">
        <button
          v-for="[value, label] in CATEGORIES"
          :key="value"
          :data-category="value"
          :class="{ selected: category === value }"
          :aria-pressed="category === value"
          @click="category = value"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <p id="glossary-count" class="glossary-count" role="status" aria-live="polite">{{ results.length }} / {{ GLOSSARY.length }} fogalom</p>
    <div id="glossary-grid" class="glossary-grid">
      <article v-for="[term, cat, meaning, example] in results" :key="term" class="glossary-card">
        <span class="glossary-category">{{ cat }}</span>
        <h2>{{ term }}</h2>
        <p>{{ meaning }}</p>
        <div class="glossary-example"><span>PÉLDÁUL</span>{{ example }}</div>
      </article>
      <div v-if="!results.length" class="empty-search">
        <h2>Erre még nincs találat.</h2>
        <p>Próbálj rövidebb kifejezést, vagy válts a „Minden” kategóriára.</p>
        <button class="button secondary" data-test="glossary-clear" @click="clear">Keresés törlése<AppIcon name="reset" /></button>
      </div>
    </div>

    <div class="learning-panel">
      <h2>A legjobb következő lépés? Próbáld ki.</h2>
      <p>
        A fogalmak a játékban életre kelnek: az algoritmus a robot útja, a feltétel a miniapp döntése, a teszteset pedig egy
        konkrét próba.
      </p>
      <div class="game-actions" style="margin-top: 20px">
        <button class="button primary" @click="openMission(0)"><AppIcon name="code" />Robotprogramozás</button>
        <button class="button secondary" @click="openBonus('quiz')">Tech radar<AppIcon name="arrow" /></button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { GLOSSARY } from 'data/glossary'
import { searchGlossary } from 'logic/search'
import { useNavigation } from 'src/composables/useNavigation'

const CATEGORIES = [
  ['all', 'Minden'],
  ['alapok', 'Alapok'],
  ['fejlesztés', 'Fejlesztés'],
  ['tesztelés', 'Tesztelés']
]

const { openMission, openBonus } = useNavigation()
const query = ref('')
const category = ref('all')
const search = ref(null)
const results = computed(() => searchGlossary(GLOSSARY, query.value, category.value))

function clear() {
  query.value = ''
  category.value = 'all'
  search.value.focus()
}
</script>
