<!-- 01 / FEJLESZTŐ: a diák nyilakból programot épít, Bit pedig lépésről lépésre végrehajtja. -->
<template>
  <GameTitle
    label="01 / FEJLESZTŐ · A TE UTASÍTÁSAID, BIT KALANDJA"
    :title="level.title"
    :description="level.intro"
    :progress="`${store.difficulty.name} · ${level.size} × ${level.size}`"
  />

  <div class="level-tabs" aria-label="Robotpályák">
    <button
      v-for="(l, i) in levels"
      :key="i"
      class="level-tab"
      :class="{ active: i === profile.robotLevel }"
      :data-level="i"
      :aria-current="i === profile.robotLevel ? 'step' : undefined"
      @click="selectLevel(i)"
    >
      <span>{{ profile.robotSolved.includes(i) ? '✓' : '0' + (i + 1) }}</span>{{ l.title }}
    </button>
  </div>

  <div class="game-layout robot-layout">
    <div class="game-panel board-panel">
      <div class="panel-heading">
        <h2>Bit játszótere</h2>
        <span class="panel-tag"><span></span><span id="run-status">{{ status }}</span></span>
      </div>
      <div class="robot-board-wrap">
        <RobotBoard :level="level" :position="position ?? level.start" :visited="visited" :chip-collected="chipCollected" />
        <div class="board-legend">
          <span><i class="legend-box start"></i>Bit</span><span>✦ Cél</span><span v-if="level.chip">◆ Adatcsip</span>
          <span><i class="legend-box wall"></i>Akadály</span>
        </div>
      </div>
      <div class="board-metrics">
        <span><AppIcon name="flag" />3 pálya ezen a szinten</span><span><AppIcon name="bolt" />+20 XP / új pálya</span>
      </div>
      <p class="panel-description">
        A „Fel” mindig a képernyő teteje felé visz.
        {{ level.chip ? 'A lila csipet fel kell venned a cél előtt.' : 'A robot a teljes utasítássort követi; a végén érjen a csillaghoz.' }}
      </p>
    </div>

    <div class="game-panel">
      <div class="panel-heading">
        <h2>A te programod</h2>
        <button class="text-button" @click="showHint"><AppIcon name="light" />Segítség</button>
      </div>
      <p class="panel-description">
        Válassz irányt! A hozzáadott blokkot kattintással törölheted.
        {{ advanced ? 'Az ismétlés több azonos lépést fog össze.' : 'Egy nyíl egy mezőt jelent.' }}
      </p>
      <div class="repeat-row">
        <label for="repeat-count">Utasítás ismétlése</label>
        <select id="repeat-count" v-model.number="repeat" aria-label="Új utasítás ismétlésszáma" :disabled="running">
          <option :value="1">×1 — egyszer</option>
          <option :value="2">×2 — kétszer</option>
          <option :value="3">×3 — háromszor</option>
          <option :value="4">×4 — négyszer</option>
        </select>
      </div>
      <div class="command-palette">
        <button
          v-for="(d, key) in DIRECTIONS"
          :key="key"
          class="command-button"
          :data-direction="key"
          :aria-label="`${d.label} utasítás hozzáadása`"
          :disabled="running"
          @click="addCommand(key)"
        >
          <AppIcon :name="d.icon" />{{ d.label }}
        </button>
      </div>
      <CommandQueue :queue="queue" :steps="steps" :active="activeBlock" :disabled="running" @remove="removeCommand" />
      <div class="game-actions">
        <button id="run-robot" class="button dark" :disabled="running || !steps" @click="run"><AppIcon name="play" />Program indítása</button>
        <button id="undo-command" class="button secondary" :disabled="running || !steps" @click="undo"><AppIcon name="left" />Visszavonás</button>
        <button id="clear-commands" class="icon-button" aria-label="Program törlése" :disabled="running || !steps" @click="clear">
          <AppIcon name="reset" />
        </button>
      </div>

      <div id="robot-feedback" role="status" aria-live="polite">
        <FeedbackBox v-if="feedback?.kind === 'hint'" title="Bit útvonaltippje">
          Egy lehetséges útvonal a starttól:
          <span class="hint-route">{{ hintText }}</span>Az ismétlésszámot a nyíl hozzáadása előtt állíthatod. Ha 4-nél több lépést
          látsz egy irányba, több blokkra oszd.
        </FeedbackBox>
        <FeedbackBox v-else-if="feedback?.kind === 'success'" type="success" :title="`Bit célba ért! ${feedback.first ? '+20 XP' : 'Újra sikerült!'}`">
          <span>{{ feedback.steps }} lépés, {{ feedback.blocks }} utasításblokk. {{ level.note }}</span><br />
          <button v-if="nextLevel === undefined" class="button primary" style="margin-top: 12px" data-test="finish-robot" @click="$emit('complete')">
            Fejlesztői jelvény átvétele<AppIcon name="arrow" />
          </button>
          <button v-else class="button primary" style="margin-top: 12px" @click="selectLevel(nextLevel)">
            Jöhet a következő pálya<AppIcon name="arrow" />
          </button>
        </FeedbackBox>
        <FeedbackBox v-else-if="feedback" type="error" :title="feedback.title">{{ feedback.text }}</FeedbackBox>
      </div>

      <button v-if="profile.robotSolved.length === 3" class="button primary saved-continue" data-test="finish-robot" @click="$emit('complete')">
        Mindhárom pálya kész! Jelvény átvétele<AppIcon name="arrow" />
      </button>
    </div>
  </div>

  <LearningNote title="Ezt tanulod közben:">{{ level.note }}</LearningNote>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { ROBOT_LEVELS } from 'data/robotLevels'
import { DIRECTIONS } from 'logic/directions'
import { groupRoute, isBlocked, samePos, solutionRoute } from 'logic/route'
import { useGameStore } from 'stores/game'
import { celebrate, prefersReducedMotion, toast } from 'src/composables/useUi'
import GameTitle from 'components/game/GameTitle.vue'
import LearningNote from 'components/game/LearningNote.vue'
import FeedbackBox from 'components/game/FeedbackBox.vue'
import RobotBoard from './RobotBoard.vue'
import CommandQueue from './CommandQueue.vue'

defineEmits(['complete'])

const store = useGameStore()
const profile = computed(() => store.profile)
const levels = computed(() => ROBOT_LEVELS[store.game.difficulty])
const level = computed(() => levels.value[profile.value.robotLevel])
const advanced = computed(() => store.game.difficulty !== 'explorer')
// Felfedező szinten rövidebb programok is elegendők, a nagy labirintusokhoz több lépés kell.
const stepLimit = computed(() => (advanced.value ? 120 : 24))

const queue = ref([]) // [{ dir: 'up', repeat: 2 }, ...]
const repeat = ref(1)
const position = ref(null) // null = a starton áll, még nem futott
const visited = ref([])
const chipCollected = ref(false)
const running = ref(false)
const activeBlock = ref(-1)
const status = ref('Készen áll')
const feedback = ref(null)

const steps = computed(() => queue.value.reduce((sum, c) => sum + c.repeat, 0))
const nextLevel = computed(() => [0, 1, 2].find((i) => !profile.value.robotSolved.includes(i)))
const hintText = computed(() =>
  groupRoute(solutionRoute(level.value))
    .map((g) => `${DIRECTIONS[g.dir].arrow}${g.count > 1 ? ' ×' + g.count : ''}`)
    .join(' · ')
)

// Minden futás kap egy sorszámot; ha közben új futás indul vagy elhagyjuk az oldalt, a régi leáll.
let runVersion = 0
onBeforeUnmount(() => runVersion++)

function resetBoard() {
  position.value = null
  visited.value = []
  chipCollected.value = false
  feedback.value = null
  status.value = 'Készen áll'
}

function selectLevel(i) {
  runVersion++
  running.value = false
  activeBlock.value = -1
  profile.value.robotLevel = i
  queue.value = []
  resetBoard()
}

function addCommand(dir) {
  if (running.value) return
  if (steps.value + repeat.value > stepLimit.value) {
    toast(`Ebbe a programba legfeljebb ${stepLimit.value} lépés fér. Használd a törlést vagy a visszavonást!`)
    return
  }
  queue.value.push({ dir, repeat: repeat.value })
}

const removeCommand = (i) => !running.value && queue.value.splice(i, 1)
const undo = () => !running.value && queue.value.pop()

function clear() {
  if (running.value) return
  queue.value = []
  resetBoard()
}

const showHint = () => (feedback.value = { kind: 'hint' })
const fail = (title, text) => (feedback.value = { kind: 'error', title, text })
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function run() {
  if (running.value || !queue.value.length) return
  const version = ++runVersion
  const l = level.value
  running.value = true
  resetBoard()
  position.value = [...l.start]

  const commands = queue.value.flatMap((c, block) => Array.from({ length: c.repeat }, () => ({ dir: c.dir, block })))
  const delay = prefersReducedMotion() ? 30 : advanced.value ? 150 : 300
  let failed = false

  for (let i = 0; i < commands.length; i++) {
    activeBlock.value = commands[i].block
    status.value = `Futás · ${i + 1} / ${commands.length}`
    await wait(delay)
    if (version !== runVersion) return

    const d = DIRECTIONS[commands[i].dir]
    const next = [position.value[0] + d.dx, position.value[1] + d.dy]
    if (isBlocked(l, next)) {
      failed = true
      fail(
        `A(z) ${i + 1}. lépésnél elakadtam!`,
        `A(z) ${commands[i].block + 1}. blokk akadályra vagy a pályán kívülre vinne. Kattints a blokkra a törléshez, majd próbáld újra. A robot mindig a startról indul.`
      )
      break
    }
    visited.value.push(position.value)
    position.value = next
    if (l.chip && samePos(next, l.chip)) chipCollected.value = true
  }

  running.value = false
  activeBlock.value = -1
  status.value = failed ? 'Javításra vár' : 'Futás kész'
  if (failed) return

  if (!samePos(position.value, l.goal))
    return fail(
      'Már mozog a programod!',
      'A program véget ért, de Bit még nincs a csillagnál. Egészítsd ki az utasításokat, vagy tervezz másik utat.'
    )
  if (l.chip && !chipCollected.value)
    return fail(
      'A cél megvan, de a csip még hiányzik.',
      'A program feladata két részből áll: először adatcsip, utána célba érés. Tervezd bele az útvonalba a lila ◆ mezőt is!'
    )

  const first = store.solveRobotLevel(profile.value.robotLevel)
  feedback.value = { kind: 'success', first, steps: commands.length, blocks: queue.value.length }
  celebrate(15)
}
</script>
