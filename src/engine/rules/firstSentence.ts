import type { ChangeEntry } from '../types'
import { getFullText, paragraphsOf, wrapTextRange } from '../dom'
import { firstSentenceEnd } from '../text/sentence'

const MIN_ANCHOR_LENGTH = 80

export function firstSentence(body: Element, mode: 'bold' | 'highlight'): ChangeEntry[] {
  const changes: ChangeEntry[] = []
  let count = 0
  for (const p of paragraphsOf(body)) {
    const text = getFullText(p)
    if (text.trim().length < MIN_ANCHOR_LENGTH) continue
    const end = firstSentenceEnd(text)
    if (end <= 0 || end >= text.length) continue
    wrapTextRange(p, 0, end, (doc) => {
      const el = mode === 'bold' ? doc.createElement('strong') : doc.createElement('span')
      el.setAttribute('class', mode === 'bold' ? 'fx-anchor' : 'fx-hl')
      return el
    })
    count += 1
  }
  if (count > 0) {
    changes.push({
      rule: 'firstSentence',
      detail: `首句${mode === 'bold' ? '加粗' : '高亮'} ${count} 处`,
    })
  }
  return changes
}
