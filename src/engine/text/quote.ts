import type { Span } from '../types'

type Family = 'curly1' | 'curly2' | 'corner1' | 'corner2' | 'straightD' | 'straightS' | 'fullD' | 'fullS'

interface CharInfo {
  open: boolean
  close: boolean
  fam: Family
}

const CHAR_MAP: Record<string, CharInfo> = {
  '“': { open: true, close: false, fam: 'curly1' },
  '”': { open: false, close: true, fam: 'curly1' },
  '‘': { open: true, close: false, fam: 'curly2' },
  '’': { open: false, close: true, fam: 'curly2' },
  '「': { open: true, close: false, fam: 'corner1' },
  '」': { open: false, close: true, fam: 'corner1' },
  '『': { open: true, close: false, fam: 'corner2' },
  '』': { open: false, close: true, fam: 'corner2' },
  '＂': { open: true, close: true, fam: 'fullD' },
  '＇': { open: true, close: true, fam: 'fullS' },
  '"': { open: true, close: true, fam: 'straightD' },
  "'": { open: true, close: true, fam: 'straightS' },
}

export function scanQuotes(text: string): Span[] {
  const spans: Span[] = []
  const stack: { fam: Family; start: number }[] = []
  for (let i = 0; i < text.length; i++) {
    const info = CHAR_MAP[text[i]]
    if (!info) continue
    const top = stack[stack.length - 1]
    if (top && top.fam === info.fam) {
      stack.pop()
      if (stack.length === 0) spans.push({ start: top.start, end: i + 1 })
    } else if (info.open) {
      stack.push({ fam: info.fam, start: i })
    } else if (top) {
      stack.pop()
      if (stack.length === 0) spans.push({ start: top.start, end: i + 1 })
    }
  }
  if (stack.length > 0) spans.push({ start: stack[0].start, end: text.length })
  return spans
}

export function hasQuote(text: string): boolean {
  return scanQuotes(text).length > 0
}

const STRAIGHT_REPLACEMENT: Record<string, { open: string; close: string }> = {
  straightD: { open: '“', close: '”' },
  fullD: { open: '“', close: '”' },
  straightS: { open: '‘', close: '’' },
  fullS: { open: '‘', close: '’' },
}

// 直角引号与弯引号原样保留（直角引号是对话拆段的依据）；仅半角/全角直引号统一为弯引号
export function normalizeQuotesText(text: string): string {
  const chars = [...text]
  const stack: Family[] = []
  for (let i = 0; i < chars.length; i++) {
    const info = CHAR_MAP[chars[i]]
    if (!info) continue
    const top = stack[stack.length - 1]
    if (top && top === info.fam) {
      stack.pop()
      const rep = STRAIGHT_REPLACEMENT[info.fam]
      if (rep) chars[i] = rep.close
    } else if (info.open) {
      stack.push(info.fam)
      const rep = STRAIGHT_REPLACEMENT[info.fam]
      if (rep) chars[i] = rep.open
    } else if (top) {
      stack.pop()
      const rep = STRAIGHT_REPLACEMENT[info.fam]
      if (rep) chars[i] = rep.close
    }
  }
  return chars.join('')
}
