import type { ChangeEntry } from '../types'
import { normalizeQuotesText } from '../text/quote'

function normalizeText(text: string): string {
  let t = text
  t = t.replace(/…+/g, '……')
  t = t.replace(/\.{2,}/g, '……')
  t = t.replace(/。{2,}/g, '……')
  t = t.replace(/-{2,}|–{2,}|—+/g, '——')
  t = normalizeQuotesText(t)
  return t
}

export function normalizePunct(body: Element): ChangeEntry[] {
  const changes: ChangeEntry[] = []
  let count = 0
  const walker = body.ownerDocument.createTreeWalker(body, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  while (walker.nextNode()) nodes.push(walker.currentNode as Text)
  for (const node of nodes) {
    const original = node.nodeValue ?? ''
    const next = normalizeText(original)
    if (next !== original) {
      node.nodeValue = next
      count += 1
    }
  }
  if (count > 0) changes.push({ rule: 'normalizePunct', detail: `规范化 ${count} 处文本节点` })
  return changes
}
