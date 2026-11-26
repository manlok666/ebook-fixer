import { describe, expect, it } from 'vitest'
import { diffParagraphLists, extractChapterParagraphs } from '../src/engine/diff'

describe('engine/diff', () => {
  it('未变段落两侧一致', () => {
    const pairs = diffParagraphLists(['一', '二'], ['一', '二'])
    expect(pairs).toHaveLength(2)
    expect(pairs.every((p) => !p.changed)).toBe(true)
  })

  it('改动段落配对并标注字符级变化', () => {
    const pairs = diffParagraphLists(['开头不变结尾变'], ['开头不变结尾不同'])
    expect(pairs).toHaveLength(1)
    expect(pairs[0].changed).toBe(true)
    const rightText = pairs[0].right.map((s) => s.text).join('')
    expect(rightText).toBe('开头不变结尾不同')
    expect(pairs[0].right.some((s) => s.changed)).toBe(true)
    expect(pairs[0].left.some((s) => s.changed)).toBe(true)
  })

  it('新增与删除段落单独成行', () => {
    const pairs = diffParagraphLists(['删掉的段'], ['新来的段'])
    expect(pairs).toHaveLength(1)
    expect(pairs[0].changed).toBe(true)
    expect(pairs[0].left.map((s) => s.text).join('')).toBe('删掉的段')
    expect(pairs[0].right.map((s) => s.text).join('')).toBe('新来的段')
  })

  it('从章节 XHTML 中提取段落文本', () => {
    const xhtml = `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>t</title></head><body><p>第一段。</p><p>第二段。</p></body></html>`
    expect(extractChapterParagraphs(xhtml, 'ch')).toEqual(['第一段。', '第二段。'])
  })
})
