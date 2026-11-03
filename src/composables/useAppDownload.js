import { APP_TEMPLATES } from 'data/appTemplates'
import { appProblem, downloadBlob, miniappHTML } from 'logic/download'
import { useGameStore } from 'stores/game'
import { toast } from './useUi'

// A kiválasztott miniapp letöltése önálló HTML-fájlként — csak ha kész és tesztelt.
export function useAppDownload() {
  const store = useGameStore()
  return function downloadApp() {
    const template = APP_TEMPLATES[store.profile.template]
    const app = store.profile.apps[store.profile.template]
    if (appProblem(template, app)) return toast('Előbb készítsd el és teszteld az appot!')
    downloadBlob(miniappHTML(template, app), 'sajat-miniapp.html', 'text/html;charset=utf-8')
  }
}
