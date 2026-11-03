import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'

// Mobilon a fejléc rögzített (64 px), ezért ott nagyobb eltolással görgetünk egy szekcióhoz.
const sectionOffset = () => (window.innerWidth <= 760 ? 84 : 24)
const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth')

export default () =>
  createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) return savedPosition // vissza/előre gomb
      if (to.hash) return { el: to.hash, top: sectionOffset(), behavior: smooth() } // pl. /#kuldetesek
      return { left: 0, top: 0 }
    }
  })
