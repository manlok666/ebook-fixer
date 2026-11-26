import type { ChangeEntry, RuleSettings } from '../types'
import { bodyOf } from '../dom'

const STYLE_ID = 'fx-style'

export function injectCss(doc: Document, s: RuleSettings['typography']): ChangeEntry[] {
  const body = bodyOf(doc)
  if (!body) return []
  body.classList.add('fx-root')
  const indent = s.indent === 'em2' ? 'text-indent: 2em;' : 'text-indent: 0;'
  const css = [
    `body.fx-root { max-width: ${s.maxLineChars + 2}em; margin: 0 auto; padding: 0 1em; }`,
    `body.fx-root p { line-height: ${s.lineHeight}; margin: 0 0 ${s.paragraphGap}em; ${indent} }`,
    `body.fx-root .fx-scene { text-align: center; margin: 1.2em 0; letter-spacing: 0.5em; color: #999; text-indent: 0; }`,
    `body.fx-root .fx-hl { background: #f3f3f3; border-radius: 3px; padding: 0 0.15em; }`,
    `body.fx-root .fx-anchor { font-weight: 700; }`,
  ].join('\n')
  const head = doc.getElementsByTagName('head')[0]
  if (head) {
    const existing = doc.getElementById(STYLE_ID)
    if (existing) existing.textContent = css
    else {
      const style = doc.createElement('style')
      style.setAttribute('id', STYLE_ID)
      style.textContent = css
      head.appendChild(style)
    }
  }
  return [{ rule: 'injectCss', detail: '注入阅读排版样式' }]
}
