import type { ChangeEntry, EpubBook, RuleSettings } from './types'
import { parseXHTML, serializeXHTML } from './epub/parse'
import { bodyOf } from './dom'
import { normalizePunct } from './rules/normalizePunct'
import { splitDialogue } from './rules/splitDialogue'
import { splitLongParagraph } from './rules/splitLongParagraph'
import { sceneSeparator } from './rules/sceneSeparator'
import { firstSentence } from './rules/firstSentence'
import { injectCss } from './rules/injectCss'

export interface ProcessResult {
  modified: Map<string, string>
  changes: ChangeEntry[]
  warnings: string[]
}

export function processChapterText(text: string, xmlDecl: string | null, label: string, s: RuleSettings): {
  output: string
  changes: ChangeEntry[]
  warning: string | null
} {
  const { doc, warning } = parseXHTML(text, label)
  const body = bodyOf(doc)
  if (!body) return { output: text, changes: [], warning: `${label}：找不到 body，跳过处理` }
  const changes: ChangeEntry[] = []
  if (s.normalizePunct.enabled) changes.push(...normalizePunct(body))
  if (s.dialogue.enabled) changes.push(...splitDialogue(body))
  if (s.splitLong.enabled) changes.push(...splitLongParagraph(body, s.splitLong.targetLength))
  if (s.sceneBreak.enabled) changes.push(...sceneSeparator(body))
  if (s.firstSentence.mode !== 'off') changes.push(...firstSentence(body, s.firstSentence.mode))
  if (s.typography.enabled) changes.push(...injectCss(doc, s.typography))
  if (changes.length === 0) return { output: text, changes, warning }
  return { output: serializeXHTML(doc, xmlDecl), changes, warning }
}

export function processBook(book: EpubBook, s: RuleSettings): ProcessResult {
  const modified = new Map<string, string>()
  const changes: ChangeEntry[] = []
  const warnings: string[] = [...book.warnings]
  for (const chapter of book.chapters) {
    const result = processChapterText(chapter.text, chapter.xmlDecl, chapter.path, s)
    if (result.warning) warnings.push(result.warning)
    if (result.output !== chapter.text) modified.set(chapter.path, result.output)
    changes.push(...result.changes)
  }
  return { modified, changes, warnings }
}
