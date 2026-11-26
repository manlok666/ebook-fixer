import type { ChangeEntry } from '../types'
import { getFullText, paragraphsOf } from '../dom'

const SCENE_CHARS = /[*＊·•◆◇☆★○●※]/
const SCENE_ONLY = /^[\s*＊·•◆◇☆★○●※]*$/

export function sceneSeparator(body: Element): ChangeEntry[] {
  const changes: ChangeEntry[] = []
  let count = 0
  for (const p of paragraphsOf(body)) {
    const text = getFullText(p).trim()
    if (text.length === 0 || text.length > 12) continue
    if (!SCENE_CHARS.test(text) || !SCENE_ONLY.test(text)) continue
    p.textContent = ''
    p.appendChild(body.ownerDocument.createTextNode('◇　◇　◇'))
    p.classList.add('fx-scene')
    count += 1
  }
  if (count > 0) changes.push({ rule: 'sceneBreak', detail: `场景分隔符 ${count} 处` })
  return changes
}
