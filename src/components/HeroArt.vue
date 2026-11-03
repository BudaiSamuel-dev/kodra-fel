<!-- A főoldali illusztráció: Bit, a robot. Tisztán CSS-ből rajzolva. -->
<template>
  <div class="hero-art">
    <div class="art-top"><span><span class="art-status"></span>JÁTÉKMÓD: FELFEDEZÉS</span><AppIcon name="spark" /></div>
    <div class="art-orbit orbit-one"></div>
    <div class="art-orbit orbit-two"></div>
    <div class="code-float code-one">
      <span class="code-purple">ha</span> kíváncsi_vagy:<br /><span class="code-indent">kaland.<span class="code-lime">indul</span>()</span>
    </div>
    <div class="iso-board" aria-hidden="true">
      <div class="iso-tiles"></div>
      <span class="iso-path path-1"></span><span class="iso-path path-2"></span><span class="iso-path path-3"></span><span class="iso-path path-4"></span>
      <span class="iso-block block-1"></span><span class="iso-block block-2"></span>
      <span class="iso-goal">✦</span>
    </div>
    <div class="big-bot" aria-hidden="true">
      <div class="bot-aerial"></div>
      <div class="bot-ear left"></div>
      <div class="bot-ear right"></div>
      <div class="bot-head">
        <div class="bot-face"><i></i><i></i><b></b></div>
        <span class="bot-shine"></span>
      </div>
      <div class="bot-body"><span></span></div>
      <div class="bot-foot foot-left"></div>
      <div class="bot-foot foot-right"></div>
    </div>
    <button class="art-tag" @click="bitMessage"><AppIcon name="bolt" />Szia, Bit vagyok! Kattints rám.</button>
    <div class="art-bottom">
      <span class="art-key">&lt;/&gt;</span><span>Kis lépésekből<br /><strong>nagy dolgok születnek.</strong></span>
      <span class="art-cursor"><AppIcon name="arrow" /></span>
    </div>
  </div>
</template>

<script setup>
import { toast } from 'src/composables/useUi'

const MESSAGES = [
  'Szia! Én Bit vagyok. Te tervezel, én pontosan követem az utasításaidat.',
  'A hibázás adat. Próbáld ki, figyeld meg, és javíts egy lépést!',
  'Kezdd a Felfedező szinten. Az első programodhoz három nyíl is elég.',
  'Az ismétlés nem csalás: a → ×3 egy teljesen rendes program!'
]
const bitMessage = () => toast(MESSAGES[Math.floor(Math.random() * MESSAGES.length)])
</script>
