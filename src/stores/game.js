import { defineStore } from 'pinia'
import { computed, reactive, watch } from 'vue'
import { DIFFICULTIES } from 'data/difficulties'
import { freshGame, loadGame, saveGame } from 'logic/storage'
import { rankFor, totalXP } from 'logic/xp'

// A teljes játékállapot egy helyen. Minden változás azonnal a localStorage-ba kerül.
export const useGameStore = defineStore('game', () => {
  const game = reactive(loadGame())

  const profile = computed(() => game.profiles[game.difficulty])
  const difficulty = computed(() => DIFFICULTIES.find((d) => d.id === game.difficulty))
  const xp = computed(() => totalXP(game))
  const rank = computed(() => rankFor(xp.value))

  watch(game, () => saveGame(game), { deep: true })

  // Hozzáadja az indexet a listához. true, ha most először (ilyenkor jár XP).
  function addOnce(list, index) {
    if (list.includes(index)) return false
    list.push(index)
    return true
  }

  return {
    game,
    profile,
    difficulty,
    xp,
    rank,
    setDifficulty(id) {
      if (DIFFICULTIES.some((d) => d.id === id)) game.difficulty = id
    },
    toggleTheme() {
      game.theme = game.theme === 'dark' ? 'light' : 'dark'
    },
    solveRobotLevel: (i) => addOnce(profile.value.robotSolved, i),
    reportScenario: (i) => addOnce(profile.value.testReports, i),
    completeMission: (n) => addOnce(profile.value.completed, n),
    solveDebug: (i) => addOnce(game.bonus.debug, i),
    answerQuiz(i, answer, correct) {
      if (!game.bonus.quiz[i]) game.bonus.quiz[i] = { answer, correct }
    },
    tick() {
      profile.value.elapsed++
    },
    // Új diák: minden haladás törlődik, csak a téma marad.
    reset() {
      const theme = game.theme
      Object.assign(game, freshGame(), { theme })
    }
  }
})
