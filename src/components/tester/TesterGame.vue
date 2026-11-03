<!-- 02 / TESZTELŐ: a diák kipróbálja a kért eseteket egy szándékosan hibás demóappon, majd pontos jelentést ad. -->
<template>
  <GameTitle
    label="02 / TESZTELŐ · ITT A JÓ KÉRDÉS A SZUPERERŐD"
    title="Kapd el a hibát!"
    description="Olvasd el a szabályt, próbáld ki a megadott eseteket, és jelentsd, amit tényleg megfigyeltél. A demóban szándékosan elhelyezett hibák vannak; profi szinten egy helyes működést is vizsgálsz."
    :progress="`${store.difficulty.name} · ${profile.testReports.length} / 3 kész`"
  />

  <div class="scenario-tabs">
    <button
      v-for="(s, i) in scenarios"
      :key="i"
      class="scenario-tab"
      :class="{ active: i === current }"
      :data-scenario="i"
      :aria-current="i === current ? 'step' : undefined"
      @click="selectScenario(i)"
    >
      {{ profile.testReports.includes(i) ? '✓ ' : `${i + 1}. ` }}{{ s.title }}
    </button>
  </div>

  <div class="game-layout">
    <div class="game-panel">
      <div class="panel-heading">
        <h2>TesztLab / {{ scenario.title }}</h2>
        <span class="panel-tag">Gyakorlóalkalmazás</span>
      </div>
      <div class="test-app">
        <div class="test-app-bar"><span aria-hidden="true">● ● ●</span><span>tesztlab.demo</span><AppIcon name="lock" /></div>
        <div class="test-app-body">
          <div class="demo-brand"><AppIcon name="bolt" />TesztLab</div>
          <h3>{{ scenario.title }}</h3>
          <p>Kitalált app · valódi gondolkodás</p>
          <form id="test-form" novalidate @submit.prevent="runTest">
            <label class="app-field">
              {{ scenario.label }}
              <input
                id="test-input"
                ref="input"
                v-model="value"
                :type="scenario.inputType"
                :placeholder="scenario.placeholder || 'Írj be egy tesztértéket'"
                autocomplete="off"
                :maxlength="scenario.inputType === 'text' ? 50 : undefined"
              />
            </label>
            <button type="submit" class="demo-submit">Eset kipróbálása<AppIcon name="play" /></button>
            <div id="test-output" class="demo-output" role="status" aria-live="polite">{{ output }}</div>
          </form>
        </div>
      </div>
      <ProbeLog :history="history" />
    </div>

    <div class="game-panel">
      <div class="panel-heading">
        <h2>A tesztelő jegyzetei</h2>
        <AppIcon name="bug" />
      </div>
      <div class="spec-box"><strong>ÍGY KELLENE MŰKÖDNIE</strong>{{ scenario.task }}</div>
      <p class="panel-description">Ezeket az eseteket ellenőrizd! A gombok kitöltik a mezőt, de a próbát neked kell elindítanod.</p>
      <div class="probe-chips">
        <button v-for="(probe, i) in scenario.probes" :key="i" :class="{ tried: tried(probe) }" :data-probe="i" @click="fillProbe(probe)">
          {{ probeLabel(probe) }}
        </button>
      </div>
      <h3 class="report-step-title">Mi a pontos megállapításod?</h3>
      <div class="report-options">
        <button
          v-for="(option, i) in scenario.options"
          :key="i"
          class="report-option"
          :class="{ selected: selection === i }"
          :data-option="i"
          :aria-pressed="selection === i"
          @click="selection = i"
        >
          {{ option }}
        </button>
      </div>
      <p id="test-count" class="test-count">{{ countText }}</p>
      <div class="game-actions">
        <button id="report-submit" class="button dark" :disabled="!allProbed || selection === null || solved" @click="submitReport">
          Jelentés beküldése<AppIcon name="arrow" />
        </button>
      </div>

      <div id="test-feedback" role="status" aria-live="polite">
        <FeedbackBox v-if="result === 'wrong'" type="error" title="Nézzük meg még egyszer!">
          A próbanaplót hasonlítsd a szabályhoz. Melyik mondat írja le pontosan a tapasztalt működést?
        </FeedbackBox>
        <FeedbackBox v-else-if="result" type="success" :title="`Pontos megfigyelés! ${result.first ? '+15 XP' : 'Újra megvan!'}`">
          {{ scenario.explanation }}<br />
          <button v-if="nextScenario === undefined" class="button primary" style="margin-top: 12px" data-test="finish-test" @click="$emit('complete')">
            Tesztelői jelvény átvétele<AppIcon name="arrow" />
          </button>
          <button v-else class="button primary" style="margin-top: 12px" @click="selectScenario(nextScenario)">
            Következő teszthelyzet<AppIcon name="arrow" />
          </button>
        </FeedbackBox>
      </div>

      <button v-if="allReportedOnOpen" class="button primary saved-continue" data-test="finish-test" @click="$emit('complete')">
        Mindhárom kész! Jelvény átvétele<AppIcon name="arrow" />
      </button>
    </div>
  </div>

  <LearningNote title="Tesztelői gondolkodás:">
    szabály → bemenet → megfigyelt eredmény → pontos jelentés. Egy jó jelentésből más is meg tudja ismételni a helyzetet.
  </LearningNote>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { TEST_SCENARIOS } from 'data/testScenarios'
import { probeLabel, testOutput } from 'logic/testOutput'
import { useGameStore } from 'stores/game'
import { celebrate } from 'src/composables/useUi'
import GameTitle from 'components/game/GameTitle.vue'
import LearningNote from 'components/game/LearningNote.vue'
import FeedbackBox from 'components/game/FeedbackBox.vue'
import ProbeLog from './ProbeLog.vue'

defineEmits(['complete'])

const store = useGameStore()
const profile = computed(() => store.profile)
const scenarios = computed(() => TEST_SCENARIOS[store.game.difficulty])
const firstOpen = () => [0, 1, 2].find((i) => !profile.value.testReports.includes(i)) ?? 0

const current = ref(firstOpen())
const scenario = computed(() => scenarios.value[current.value])
const input = ref(null)
const value = ref('')
const output = ref('')
const history = ref([]) // [{ input, output }]
const selection = ref(null)
const result = ref(null) // null | 'wrong' | { first }
const allReportedOnOpen = ref(false)

const tried = (probe) => history.value.some((h) => h.input === probe)
const allProbed = computed(() => scenario.value.probes.every(tried))
const solved = computed(() => Boolean(result.value) && result.value !== 'wrong')
const nextScenario = computed(() => [0, 1, 2].find((i) => !profile.value.testReports.includes(i)))

const countText = computed(() => {
  if (!history.value.length)
    return profile.value.testReports.includes(current.value)
      ? '✓ Ezt a helyzetet már megoldottad. Újra ellenőrizheted.'
      : 'Először próbáld ki az összes megadott esetet!'
  if (allProbed.value) return '✓ Minden kért esetet kipróbáltál. Mit mutatnak az eredmények?'
  const count = scenario.value.probes.filter(tried).length
  return `${count} / ${scenario.value.probes.length} kért eset kipróbálva`
})

function selectScenario(i) {
  current.value = i
  value.value = scenario.value.value ?? ''
  output.value = 'Várom a próbádat…'
  history.value = []
  selection.value = null
  result.value = null
  allReportedOnOpen.value = profile.value.testReports.length === 3
}
selectScenario(current.value)

async function fillProbe(probe) {
  value.value = probe
  await nextTick()
  input.value.focus()
}

function runTest() {
  // A number típusú mező v-modelje számot adhat: a tesztlogika mindig szöveget kap, ahogy a 2.0-ban.
  const v = String(value.value ?? '')
  output.value = testOutput(scenario.value.kind, v)
  history.value.push({ input: v, output: output.value })
}

function submitReport() {
  if (!allProbed.value || selection.value === null) return
  if (selection.value !== scenario.value.correct) {
    result.value = 'wrong'
    return
  }
  result.value = { first: store.reportScenario(current.value) }
  celebrate(12)
}
</script>
