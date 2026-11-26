import { reactive } from 'vue'
import type { RuleSettings } from '../engine/types'
import { defaultSettings } from '../engine/types'

const state = reactive<RuleSettings>(structuredClone(defaultSettings))

export function useSettings() {
  return {
    settings: state,
    reset() {
      Object.assign(state, structuredClone(defaultSettings))
    },
  }
}
