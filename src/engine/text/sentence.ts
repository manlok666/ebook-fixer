import type { Span } from '../types'

const SENTENCE_PUNCT = new Set(['。', '！', '？', '!', '?'])
const TRAILERS = new Set(['」', '』', '”', '’', '"', "'", '）', ')', '】', ']', '》', '〉', '…'])

export function isSentenceEnd(ch: string): boolean {
  return SENTENCE_PUNCT.has(ch)
}

export function splitSentences(text: string): Span[] {
  const spans: Span[] = []
  const n = text.length
  let start = 0
  let i = 0
  while (i < n) {
    const ch = text[i]
    let boundary = -1
    if (SENTENCE_PUNCT.has(ch)) {
      boundary = i + 1
    } else if (ch === '…') {
      let j = i
      while (j < n && (text[j] === '…' || text[j] === '.')) j++
      if (j - i >= 2) boundary = j
    } else if (ch === '.') {
      let j = i
      while (j < n && text[j] === '.') j++
      if (j - i >= 2) boundary = j
    }
    if (boundary > 0) {
      let e = boundary
      while (e < n && (TRAILERS.has(text[e]) || SENTENCE_PUNCT.has(text[e]))) e++
      spans.push({ start, end: e })
      start = e
      i = e
      continue
    }
    i++
  }
  if (start < n) spans.push({ start, end: n })
  return spans
}

export function firstSentenceEnd(text: string): number {
  const spans = splitSentences(text)
  return spans.length ? spans[0].end : text.length
}
