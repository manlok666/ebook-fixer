import { reactive } from 'vue'

const state = reactive<{ tab: 'diff' | 'read' }>({ tab: 'diff' })

export function usePreview() {
  return {
    state,
    setTab(tab: 'diff' | 'read') {
      state.tab = tab
    },
  }
}
