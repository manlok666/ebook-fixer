import type JSZip from 'jszip'

export interface Span {
  start: number
  end: number
}

export interface RuleSettings {
  normalizePunct: { enabled: boolean }
  dialogue: { enabled: boolean }
  splitLong: { enabled: boolean; targetLength: number }
  sceneBreak: { enabled: boolean }
  firstSentence: { mode: 'bold' | 'highlight' | 'off' }
  typography: {
    enabled: boolean
    lineHeight: number
    paragraphGap: number
    maxLineChars: number
    indent: 'none' | 'em2'
  }
}

export const defaultSettings: RuleSettings = {
  normalizePunct: { enabled: true },
  dialogue: { enabled: true },
  splitLong: { enabled: true, targetLength: 200 },
  sceneBreak: { enabled: true },
  firstSentence: { mode: 'bold' },
  typography: {
    enabled: true,
    lineHeight: 1.9,
    paragraphGap: 0.8,
    maxLineChars: 32,
    indent: 'em2',
  },
}

export interface ChangeEntry {
  rule: string
  detail: string
}

export interface Chapter {
  path: string
  href: string
  id: string
  text: string
  xmlDecl: string | null
}

export interface EpubBook {
  zip: JSZip
  entries: string[]
  opfPath: string
  title: string
  chapters: Chapter[]
  warnings: string[]
}
