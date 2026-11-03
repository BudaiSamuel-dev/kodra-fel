<!-- Bit pályája. Minden mező kap képernyőolvasó-címkét is. -->
<template>
  <div id="robot-board" class="robot-board" :style="{ gridTemplateColumns: `repeat(${level.size},1fr)` }" :data-size="level.size">
    <div
      v-for="cell in cells"
      :key="cell.key"
      class="board-cell"
      :class="{ wall: cell.wall, goal: cell.goal, chip: cell.chip, visited: cell.visited }"
      role="img"
      :aria-label="`${cell.y + 1}. sor, ${cell.x + 1}. oszlop: ${cell.label}`"
    >
      <span v-if="cell.bot" class="cell-bot" aria-hidden="true"><i></i><i></i></span>
      <template v-else-if="cell.goal">✦</template>
      <template v-else-if="cell.chip">◆</template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { samePos } from 'logic/route'

const props = defineProps({
  level: { type: Object, required: true },
  position: { type: Array, required: true },
  visited: { type: Array, required: true },
  chipCollected: Boolean
})

const cells = computed(() => {
  const { level, position, visited, chipCollected } = props
  const list = []
  for (let y = 0; y < level.size; y++)
    for (let x = 0; x < level.size; x++) {
      const pos = [x, y]
      const cell = {
        key: `${x},${y}`,
        x,
        y,
        wall: level.walls.some((w) => samePos(w, pos)),
        goal: samePos(level.goal, pos),
        chip: Boolean(level.chip) && samePos(level.chip, pos) && !chipCollected,
        visited: visited.some((p) => samePos(p, pos)),
        bot: samePos(position, pos)
      }
      cell.label = cell.bot ? 'robot' : cell.goal ? 'cél' : cell.chip ? 'adatcsip' : cell.wall ? 'akadály' : 'szabad mező'
      list.push(cell)
    }
  return list
})
</script>
