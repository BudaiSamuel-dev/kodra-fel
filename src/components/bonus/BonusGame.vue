<!-- Bónuszjátékok: Kódnyomozó (3 logikai fejtörő) és Tech radar (6 kérdés). Teljesítésért egyszer jár 120 XP. -->
<template>
  <template v-if="!finished">
    <GameTitle
      :label="`BÓNUSZ / ${debug ? 'KÓDNYOMOZÓ' : 'TECH RADAR'} · +120 XP`"
      :title="debug ? 'Kis hiba, nagy felismerés.' : 'Hangold be a tech radarod!'"
      :description="
        debug
          ? 'Nem kell ismerned a programnyelveket. Olvasd el a helyzetet, gondolkodj végig a lépéseken, és javíts a logikán!'
          : 'Hat rövid kérdés, hat új felismerés. A válaszokhoz magyarázatot kapsz, és nyugodtan újra is próbálhatod.'
      "
      :progress="`${index + 1} / ${items.length}`"
    />
    <div class="bonus-progress">
      <span v-for="(_, i) in items" :key="i" :class="{ active: i === index, done: i < index }"></span>
    </div>
    <div class="puzzle-panel">
      <span class="puzzle-category">{{ debug ? item.title : 'TECH KÉRDÉS / ' + String(index + 1).padStart(2, '0') }}</span>
      <h2>{{ debug ? item.description : item.q }}</h2>
      <div v-if="debug" class="code-window">
        <div class="code-window-bar"><span aria-hidden="true">● ● ●</span> gondolatmenet.txt</div>
        <div v-for="(line, i) in item.code" :key="i" class="code-line">
          <span>{{ i + 1 }}</span><code>{{ line }}</code>
        </div>
      </div>
      <div class="puzzle-options">
        <button
          v-for="(option, i) in item.options"
          :key="i"
          class="report-option"
          :class="{ selected: selection === i }"
          :data-option="i"
          :aria-pressed="selection === i"
          @click="select(i)"
        >
          <span class="option-letter">{{ String.fromCharCode(65 + i) }}</span>{{ option }}
        </button>
      </div>
      <div class="game-actions">
        <button id="bonus-check" class="button primary" :disabled="selection === null || revealed" @click="check">
          Megnézem<AppIcon name="arrow" />
        </button>
      </div>
      <div id="bonus-feedback" role="status" aria-live="polite">
        <FeedbackBox v-if="wrongDebug" type="error" title="Próbáld végig fejben!">
          Melyik megoldás teljesíti pontosan a leírt célt? Nyugodtan válassz másik lehetőséget.
        </FeedbackBox>
        <FeedbackBox v-else-if="revealed" :type="correct ? 'success' : ''" :title="correct ? 'Pontosan!' : 'Ebből is tanultál!'">
          <template v-if="!correct">A helyes válasz: {{ item.options[item.correct] }}. </template>{{ item.why }}<br />
          <button class="button primary" style="margin-top: 14px" data-test="bonus-next" @click="next">
            {{ index === items.length - 1 ? 'Jöhet az összegzés' : 'Következő feladvány' }}<AppIcon name="arrow" />
          </button>
        </FeedbackBox>
      </div>
    </div>
  </template>

  <div v-else class="completion-card">
    <div class="completion-icon"><AppIcon :name="debug ? 'code' : 'spark'" /></div>
    <div class="eyebrow">BÓNUSZKALAND {{ complete ? 'TELJESÍTVE' : 'ÖSSZEGZÉS' }}</div>
    <h1>{{ debug ? 'Kódnyomozó lettél!' : 'A tech radarod élesítve.' }}</h1>
    <p v-if="debug">Sorrendet, feltételt és ismétlést vizsgáltál. Ez a három ötlet rengeteg programban visszaköszön.</p>
    <p v-else>
      {{ firstTryCorrect }} / 6 kérdésre elsőre jól válaszoltál. A többi magyarázatából is tanulhattál — itt a megértés a cél.
    </p>
    <span class="earned-xp">{{ complete ? '120 XP megszerezve · egyszeri jutalom' : '' }}</span>
    <div class="completion-actions">
      <router-link class="button primary" to="/tudastar">Fedezz fel még több fogalmat<AppIcon name="arrow" /></router-link>
      <router-link class="button outline" to="/">Vissza a kalandokhoz</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { DEBUG_PUZZLES } from 'data/debugPuzzles'
import { QUIZ } from 'data/quiz'
import { useGameStore } from 'stores/game'
import { celebrate, focusHeading, scrollTop } from 'src/composables/useUi'
import GameTitle from 'components/game/GameTitle.vue'
import FeedbackBox from 'components/game/FeedbackBox.vue'

const props = defineProps({ kind: { type: String, required: true } }) // 'debug' | 'quiz'

const store = useGameStore()
const debug = computed(() => props.kind === 'debug')
const items = computed(() => (debug.value ? DEBUG_PUZZLES : QUIZ))
const isDone = (i) => (debug.value ? store.game.bonus.debug.includes(i) : Boolean(store.game.bonus.quiz[i]))

// Ott folytatjuk, ahol a diák abbahagyta.
const index = ref(Math.max(0, items.value.findIndex((_, i) => !isDone(i))))
const item = computed(() => items.value[index.value])
const selection = ref(null)
const revealed = ref(false)
const wrongDebug = ref(false)
const finished = ref(false)
const correct = computed(() => selection.value === item.value.correct)

const complete = computed(() =>
  debug.value ? store.game.bonus.debug.length === 3 : store.game.bonus.quiz.filter(Boolean).length === 6
)
const firstTryCorrect = computed(() => store.game.bonus.quiz.filter((v) => v?.correct).length)

function select(i) {
  if (revealed.value) return
  selection.value = i
  wrongDebug.value = false
}

// A Kódnyomozóban addig próbálkozhat, amíg el nem találja; a kvízben az első válasz számít, és jön a magyarázat.
function check() {
  if (selection.value === null || revealed.value) return
  if (debug.value && !correct.value) {
    wrongDebug.value = true
    return
  }
  revealed.value = true
  if (debug.value) store.solveDebug(index.value)
  else store.answerQuiz(index.value, selection.value, correct.value)
}

function next() {
  if (index.value < items.value.length - 1) {
    index.value++
    selection.value = null
    revealed.value = false
    scrollTop()
    return
  }
  finished.value = true
  celebrate()
  scrollTop()
  focusHeading()
}
</script>
