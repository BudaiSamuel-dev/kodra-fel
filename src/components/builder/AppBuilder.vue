<!-- 03 / ALKOTÓ: a diák választ egy miniappot, nevet és színt ad neki, helyessé teszi a HA-szabályt, majd teszteli. -->
<template>
  <GameTitle
    label="03 / ALKOTÓ · ÖTLETBŐL MŰKÖDŐ MINIAPP"
    title="A te ötleted. A te appod."
    description="Válassz egy projektet, formáld a saját stílusodra, és tedd helyessé a szabályát. A működő appodat a végén HTML-fájlként le is töltheted."
    progress="3 választható projekt"
  />

  <div class="template-tabs" role="group" aria-label="Miniapp kiválasztása">
    <button
      v-for="(t, i) in APP_TEMPLATES"
      :key="t.id"
      class="template-tab"
      :class="{ active: i === profile.template }"
      :data-template="i"
      :aria-pressed="i === profile.template"
      @click="selectTemplate(i)"
    >
      <AppIcon :name="t.icon" /><span><strong>{{ t.name }}</strong><small>{{ t.desc }}</small></span>
    </button>
  </div>

  <div class="game-layout">
    <div class="game-panel">
      <div class="panel-heading">
        <h2>Az ötleted műhelye</h2>
        <AppIcon name="spark" />
      </div>
      <div class="builder-form">
        <div>
          <label class="field-label" for="app-name">1. Mi legyen az app neve?</label>
          <input id="app-name" v-model="app.name" class="app-name-input" maxlength="24" placeholder="Adj nevet az ötletednek!" />
        </div>
        <div>
          <span class="field-label">2. Milyen színű legyen?</span>
          <div class="swatches" role="group" aria-label="Az app színe">
            <button
              v-for="(color, i) in COLORS"
              :key="color"
              class="swatch"
              :class="{ active: app.color === i }"
              :style="{ '--swatch': color }"
              :data-color="i"
              :aria-label="COLOR_NAMES[i]"
              :aria-pressed="app.color === i"
              @click="app.color = i"
            ></button>
          </div>
        </div>
        <div>
          <label class="field-label" for="app-rule">3. Tedd helyessé a szabályt!</label>
          <p class="panel-description">{{ template.prompt }}</p>
          <div class="rule-builder">
            <span class="rule-keyword">HA</span> {{ template.question.replace('HA ', '') }}
            <select id="app-rule" :value="app.rule" @change="changeRule($event.target.value)">
              <option v-for="[value, label] in template.choices" :key="value" :value="value">{{ label }}</option>
            </select>
            <br /><span class="rule-keyword">AKKOR</span> {{ template.then }} <br /><span class="rule-keyword">EGYÉBKÉNT</span>
            {{ template.otherwise }}
          </div>
        </div>
      </div>

      <div id="release-checks" class="release-checks">
        <span v-for="[value, label] in template.tests" :key="value" :class="{ passed: app.tests.includes(value) }">
          <AppIcon :name="app.tests.includes(value) ? 'check' : 'clock'" />{{ label }} kipróbálása
        </span>
      </div>
      <div class="game-actions" style="margin-top: 20px">
        <button class="button dark" data-test="release-app" @click="release"><AppIcon name="rocket" />Teszteltem, indulhat!</button>
      </div>
      <div id="builder-feedback" role="status" aria-live="polite">
        <FeedbackBox v-if="problem" type="error" title="Még egy apró lépés!">{{ problem }}</FeedbackBox>
      </div>
    </div>

    <AppPreview :template="template" :app="app" :active="active" :output="output" @test="tryValue" />
  </div>

  <LearningNote title="Valódi munkafolyamat kicsiben:">
    tervezés → elkészítés → tesztelés → javítás → kiadás. A szabály módosítása után újra kell tesztelned az appot.
  </LearningNote>
</template>

<script setup>
import { computed, ref } from 'vue'
import { APP_TEMPLATES, COLORS, COLOR_NAMES } from 'data/appTemplates'
import { appResult } from 'logic/appResult'
import { appProblem } from 'logic/download'
import { useGameStore } from 'stores/game'
import GameTitle from 'components/game/GameTitle.vue'
import LearningNote from 'components/game/LearningNote.vue'
import FeedbackBox from 'components/game/FeedbackBox.vue'
import AppPreview from './AppPreview.vue'

const emit = defineEmits(['complete'])

const store = useGameStore()
const profile = computed(() => store.profile)
const template = computed(() => APP_TEMPLATES[profile.value.template])
// Az app beállításai (név, szín, szabály, kipróbált esetek) a store-ban élnek, így mentődnek.
const app = computed(() => profile.value.apps[profile.value.template])

const active = ref(null)
const output = ref('Kattints, és teszteld a szabályodat!')
const problem = ref('')

function selectTemplate(i) {
  profile.value.template = i
  active.value = null
  output.value = 'Kattints, és teszteld a szabályodat!'
  problem.value = ''
}

// Szabályváltás után minden esetet újra ki kell próbálni — ahogy a valódi fejlesztésben is.
function changeRule(rule) {
  app.value.rule = rule
  app.value.tests = []
  active.value = null
  output.value = 'Új szabály! Próbáld ki újra az összes esetet.'
  problem.value = ''
}

function tryValue(value) {
  if (!app.value.tests.includes(value)) app.value.tests.push(value)
  active.value = value
  output.value = appResult(template.value.id, app.value.rule, value)
}

function release() {
  problem.value = appProblem(template.value, app.value)
  if (!problem.value) emit('complete')
}
</script>
