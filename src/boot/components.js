import AppIcon from 'components/AppIcon.vue'

// Az ikont szinte minden komponens használja, ezért globálisan regisztráljuk.
export default ({ app }) => {
  app.component('AppIcon', AppIcon)
}
