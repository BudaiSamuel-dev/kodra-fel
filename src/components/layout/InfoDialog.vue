<template>
  <dialog id="info-dialog" ref="dialog" aria-labelledby="dialog-title" @cancel.prevent="closeDialog" @click="onBackdrop">
    <button class="dialog-close icon-button" aria-label="Ablak bezárása" @click="closeDialog"><AppIcon name="close" /></button>
    <div v-if="ui.dialog === 'help'">
      <span class="mission-icon"><AppIcon name="help" /></span>
      <h2 id="dialog-title">Itt szabad próbálkozni.</h2>
      <p>
        Ha először találkozol programozással, válaszd a Felfedező szintet. A robotnál kérhetsz útvonaltippet, a
        tesztelői feladatokban pedig a mintabemenetek gombjai segítenek.
      </p>
      <dl>
        <dt>Miért gyűjtök XP-t?</dt>
        <dd>
          A felfedezést jelzi. Új robotpályáért 20, új teszthelyzetért 15, küldetésért szinttől függően 100–200 XP jár.
          Egy teljes bónuszjáték 120 XP-t ad. Ugyanazért a teljesítésért csak egyszer kapsz jutalmat.
        </dd>
        <dt>Egyedül vagy párban?</dt>
        <dd>Mindkettő működik. Párban az egyikőtök tervezzen, a másik ellenőrizzen; utána cseréljetek!</dd>
        <dt>Hol marad meg a haladás?</dt>
        <dd>Ezen a gépen, ebben a böngészőben. A szintek haladása külön tárolódik. Nincs diákfiók vagy adatküldés.</dd>
        <dt>Új diák érkezett?</dt>
        <dd>Az „Új felfedező” minden helyi játékhaladást töröl. A megjelenés beállítása megmarad.</dd>
      </dl>
      <div class="game-actions">
        <button class="button primary" @click="closeDialog">Mehet tovább!<AppIcon name="check" /></button>
        <button class="text-button" data-test="reset" @click="openDialog('reset')">Új felfedező<AppIcon name="reset" /></button>
      </div>
    </div>
    <div v-else-if="ui.dialog === 'how'">
      <span class="mission-icon"><AppIcon name="flag" /></span>
      <h2 id="dialog-title">Egy rövid kaland. Sok új ötlet.</h2>
      <p>
        A Felfedező alapútvonal 5–10 percre készült. A magasabb szintek és a bónuszok hosszabb, szabad felfedezésre
        valók. Nincs időkorlát.
      </p>
      <ol class="how-list">
        <li>
          <span><strong>Válassz szintet!</strong>Felfedező: első lépések. Kihívó: labirintusok és összehasonlító tesztek.
            Profi: adatcsipek és több határérték.</span>
        </li>
        <li>
          <span><strong>Próbáld ki mindhárom szerepet!</strong>Robotprogramozás → alkalmazástesztelés → saját miniapp. A
            feladatokat külön-külön is megnyithatod.</span>
        </li>
        <li>
          <span><strong>Vidd tovább, ami érdekel!</strong>Két bónuszjáték, 15 fogalom és részletes szakmabemutató vár. A
            saját appodat le is töltheted.</span>
        </li>
      </ol>
      <div class="game-actions">
        <button class="button primary" @click="startFromDialog">Induljon a kaland<AppIcon name="arrow" /></button>
      </div>
    </div>
    <div v-else-if="ui.dialog === 'reset'">
      <span class="mission-icon"><AppIcon name="reset" /></span>
      <h2 id="dialog-title">Új felfedező érkezik?</h2>
      <p>
        Ez törli az összes nehézségi szint haladását, a jelvényeket, az XP-t és a miniappok helyi beállításait. A
        letöltött fájlokat nem érinti.
      </p>
      <div class="game-actions">
        <button class="button dark" data-test="confirm-reset" @click="confirmReset">Igen, tiszta lappal kezdek</button>
        <button class="button secondary" @click="closeDialog">Folytatom a kalandom</button>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from 'stores/game'
import { closeDialog, openDialog, toast, ui } from 'src/composables/useUi'
import { useNavigation } from 'src/composables/useNavigation'

const dialog = ref(null)
const store = useGameStore()
const router = useRouter()
const { start } = useNavigation()
let lastFocus = null

watch(
  () => ui.dialog,
  (name, previous) => {
    if (name && !previous) {
      lastFocus = document.activeElement
      dialog.value.showModal()
    } else if (!name && dialog.value.open) {
      dialog.value.close()
      if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true })
    }
  }
)

// A háttérre (a doboz mellé) kattintás bezárja az ablakot.
function onBackdrop(e) {
  if (e.target !== dialog.value) return
  const r = dialog.value.getBoundingClientRect()
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog()
}

function startFromDialog() {
  closeDialog()
  start()
}

function confirmReset() {
  store.reset()
  closeDialog()
  router.push('/')
  toast('Új felfedező, új kaland. Kódra fel!')
}
</script>
