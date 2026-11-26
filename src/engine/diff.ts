import { diffLines, diffChars } from 'diff'
import { parseXHTML } from './epub/parse'
import { bodyOf, paragraphsOf } from './dom'

export interface DiffSpan {
  text: string
  changed: boolean
}

export interface DiffPair {
  left: DiffSpan[]
  right: DiffSpan[]
  changed: boolean
}

export function extractChapterParagraphs(text: string, label: string): string[] {
  const { doc } = parseXHTML(text, label)
  const body = bodyOf(doc)
  const source = body ? paragraphsOf(body).map((p) => p.textContent ?? '') : [doc.textContent ?? '']
  return source
    .flatMap((t) => t.split(/\n+/))
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter((t) => t.length > 0)
}

function toSpans(text: string, changed: boolean): DiffSpan[] {
  return text.length > 0 ? [{ text, changed }] : []
}

function charSpans(oldText: string, newText: string): { left: DiffSpan[]; right: DiffSpan[] } {
  const parts = diffChars(oldText, newText)
  const left: DiffSpan[] = []
  const right: DiffSpan[] = []
  for (const part of parts) {
    const span: DiffSpan = { text: part.value, changed: !!part.added || !!part.removed }
    if (part.removed) left.push(span)
    else if (part.added) right.push(span)
    else {
      left.push({ text: part.value, changed: false })
      right.push({ text: part.value, changed: false })
    }
  }
  return { left, right }
}

export function diffParagraphLists(original: string[], processed: string[]): DiffPair[] {
  const parts = diffLines(original.join('\n'), processed.join('\n'))
  const pairs: DiffPair[] = []
  let pendingDel: string[] = []
  let pendingAdd: string[] = []

  const flush = () => {
    const max = Math.max(pendingDel.length, pendingAdd.length)
    for (let i = 0; i < max; i++) {
      const oldText = pendingDel[i] ?? ''
      const newText = pendingAdd[i] ?? ''
      if (oldText && newText) {
        const { left, right } = charSpans(oldText, newText)
        pairs.push({ left, right, changed: true })
      } else if (oldText) {
        pairs.push({ left: toSpans(oldText, true), right: [], changed: true })
      } else {
        pairs.push({ left: [], right: toSpans(newText, true), changed: true })
      }
    }
    pendingDel = []
    pendingAdd = []
  }

  for (const part of parts) {
    const lines = part.value.replace(/\n$/, '').split('\n').filter((l) => l.length > 0)
    if (part.added) pendingAdd.push(...lines)
    else if (part.removed) pendingDel.push(...lines)
    else {
      flush()
      for (const line of lines) {
        pairs.push({ left: toSpans(line, false), right: toSpans(line, false), changed: false })
      }
    }
  }
  flush()
  return pairs
}
