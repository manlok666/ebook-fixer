import type { ChangeEntry, Span } from '../types'
import { getFullText, splitParagraphAtOffsets, paragraphsOf } from '../dom'
import { splitSentences } from '../text/sentence'
import { scanQuotes } from '../text/quote'

const SPEECH_VERB = /[说问答喊叫应吼骂笑叹嘟囔嚷告诉低语道]/

function isTagline(raw: string): boolean {
  const s = raw.replace(/[\s，。：:！？…—\-、；;（）()]/g, '')
  return s.length > 0 && s.length <= 15 && SPEECH_VERB.test(s)
}

// 仅直角引号「」『』作为对话依据；双引号（“”/半角）常用于术语强调，不作拆段依据
const DIALOGUE_OPEN = new Set(['「', '『'])

function dialogueSpans(text: string): Span[] {
  return scanQuotes(text).filter((s) => DIALOGUE_OPEN.has(text[s.start]))
}

function computeSegments(text: string): Span[] {
  const sentences = splitSentences(text)
  const quotes = dialogueSpans(text)
  if (quotes.length === 0) return [{ start: 0, end: text.length }]

  const rounds: Span[] = []
  for (const q of quotes) {
    let start = q.start
    let end = q.end

    const containing = sentences.find((s) => s.start <= q.end && q.end <= s.end)
    const afterEnd =
      containing && q.end < containing.end
        ? containing.end
        : (sentences.find((s) => s.start >= q.end)?.end ?? text.length)
    const tagAfter = text.slice(q.end, afterEnd)
    if (isTagline(tagAfter)) end = afterEnd

    const containingBefore = sentences.find((s) => s.start <= q.start && q.start <= s.end)
    const beforeStart =
      containingBefore && containingBefore.start < q.start
        ? containingBefore.start
        : ([...sentences].reverse().find((s) => s.end <= q.start)?.start ?? 0)
    const tagBefore = text.slice(beforeStart, q.start)
    if (isTagline(tagBefore)) start = beforeStart

    rounds.push({ start, end })
  }

  rounds.sort((a, b) => a.start - b.start)
  const merged: Span[] = []
  for (const r of rounds) {
    const last = merged[merged.length - 1]
    if (last && r.start <= last.end) last.end = Math.max(last.end, r.end)
    else merged.push({ ...r })
  }

  const segs: Span[] = []
  let pos = 0
  for (const r of merged) {
    if (r.start > pos) segs.push({ start: pos, end: r.start })
    segs.push(r)
    pos = r.end
  }
  if (pos < text.length) segs.push({ start: pos, end: text.length })
  return segs.filter((s) => s.end > s.start && text.slice(s.start, s.end).trim().length > 0)
}

export function splitDialogue(body: Element): ChangeEntry[] {
  const changes: ChangeEntry[] = []
  let count = 0
  for (const p of paragraphsOf(body)) {
    const text = getFullText(p)
    if (!text.includes('「') && !text.includes('『')) continue
    const segs = computeSegments(text)
    if (segs.length <= 1) continue
    const cuts = segs.slice(0, -1).map((s) => s.end)
    const parts = splitParagraphAtOffsets(p, cuts)
    if (parts.length <= 1) continue
    const fragment = body.ownerDocument.createDocumentFragment()
    for (const part of parts) fragment.appendChild(part)
    p.parentNode?.replaceChild(fragment, p)
    count += 1
  }
  if (count > 0) changes.push({ rule: 'dialogue', detail: `对话独立成段 ${count} 处` })
  return changes
}
