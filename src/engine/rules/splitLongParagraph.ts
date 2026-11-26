import type { ChangeEntry, Span } from '../types'
import { getFullText, splitParagraphAtOffsets, paragraphsOf } from '../dom'
import { splitSentences } from '../text/sentence'
import { scanQuotes } from '../text/quote'

const SCENE_WORDS = ['这时', '此时', '第二天', '后来', '不久', '翌日', '当晚', '次日']
const TRANSITION_WORDS = ['但', '然而', '不过', '可是', '只是', '于是', '因此']

function scorePoint(text: string, pos: number): number {
  const next = text.slice(pos, pos + 4)
  if (SCENE_WORDS.some((w) => next.startsWith(w))) return 3
  if (TRANSITION_WORDS.some((w) => next.startsWith(w))) return 2
  return 1
}

function insideQuote(quotes: Span[], pos: number): boolean {
  return quotes.some((q) => q.start < pos && pos < q.end)
}

export function splitLongParagraph(body: Element, targetLength: number): ChangeEntry[] {
  const changes: ChangeEntry[] = []
  let count = 0
  for (const p of paragraphsOf(body)) {
    const text = getFullText(p)
    if (text.length <= targetLength) continue
    const quotes = scanQuotes(text)
    const sentenceEnds = splitSentences(text).map((s) => s.end)
    const candidates = sentenceEnds.filter((e) => e < text.length && e > 0 && !insideQuote(quotes, e))
    if (candidates.length === 0) continue

    const cuts: number[] = []
    let start = 0
    while (text.length - start > targetLength) {
      const window = candidates.filter((e) => e > start && e - start >= targetLength * 0.4)
      const pool = window.length > 0 ? window : candidates.filter((e) => e > start)
      if (pool.length === 0) break
      let best = pool[0]
      let bestScore = -1
      let bestDist = Infinity
      for (const e of pool) {
        const score = scorePoint(text, e)
        const dist = Math.abs(e - start - targetLength)
        if (score > bestScore || (score === bestScore && dist < bestDist)) {
          best = e
          bestScore = score
          bestDist = dist
        }
      }
      cuts.push(best)
      start = best
    }
    if (cuts.length === 0) continue
    const parts = splitParagraphAtOffsets(p, cuts)
    if (parts.length <= 1) continue
    const fragment = body.ownerDocument.createDocumentFragment()
    for (const part of parts) fragment.appendChild(part)
    p.parentNode?.replaceChild(fragment, p)
    count += 1
  }
  if (count > 0) changes.push({ rule: 'splitLong', detail: `长段拆分 ${count} 处` })
  return changes
}
