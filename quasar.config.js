import { fileURLToPath } from 'node:url'

const dir = (path) => fileURLToPath(new URL(path, import.meta.url))
export default () => ({
  boot: ['components'],
  // Sorrend számít: reset → a Kódra fel! stílusa → saját kiegészítések
  css: ['fonts.css', 'reset.scss', 'kodra.css', 'light-generated.css', 'light.scss', 'dark.scss', 'app.scss'],
  extras: [],
  build: {
    target: { browser: ['es2022', 'firefox115', 'chrome115', 'safari14'] },
    vueRouterMode: 'history',
    alias: {
      src: dir('./src'),
      components: dir('./src/components'),
      layouts: dir('./src/layouts'),
      pages: dir('./src/pages'),
      assets: dir('./src/assets'),
      boot: dir('./src/boot'),
      stores: dir('./src/stores'),
      data: dir('./src/data'),
      logic: dir('./src/logic')
    }
  },
  devServer: {
    port: 4173,
    strictPort: true,
    open: false
  },
  framework: {
    config: { dark: false },
    lang: 'hu',
    plugins: []
  },
  animations: []
})
