import { describe, expect, it } from 'vitest'
import JSZip from 'jszip'
import { buildTestEpub, CHAPTER1_XHTML } from './fixtures'
import { unpackEPUB } from '../src/engine/epub/unpack'
import { repackEPUB } from '../src/engine/epub/repack'
import { processChapterText, processBook } from '../src/engine/pipeline'
import { defaultSettings, type RuleSettings } from '../src/engine/types'

function allOff(): RuleSettings {
  return {
    normalizePunct: { enabled: false },
    dialogue: { enabled: false },
    splitLong: { enabled: false, targetLength: 200 },
    sceneBreak: { enabled: false },
    firstSentence: { mode: 'off' },
    typography: {
      enabled: false,
      lineHeight: 1.9,
      paragraphGap: 0.8,
      maxLineChars: 32,
      indent: 'em2',
    },
  }
}

describe('epub round-trip', () => {
  it('解包得到 spine 章节', async () => {
    const data = await buildTestEpub()
    const book = await unpackEPUB(data)
    expect(book.title).toBe('测试书')
    expect(book.chapters).toHaveLength(2)
    expect(book.chapters[0].href).toBe('ch1.xhtml')
    expect(book.chapters[0].path).toBe('OEBPS/ch1.xhtml')
    expect(book.chapters[0].xmlDecl).toContain('<?xml')
  })

  it('重打包后 mimetype 为首个条目且不压缩', async () => {
    const data = await buildTestEpub()
    const book = await unpackEPUB(data)
    const bytes = await repackEPUB(book, new Map())
    const head = new DataView(bytes.buffer, bytes.byteOffset, 30)
    expect(head.getUint32(0, true)).toBe(0x04034b50)
    expect(head.getUint16(8, true)).toBe(0)
    expect(head.getUint16(26, true)).toBe(8)
    const name = new TextDecoder().decode(bytes.slice(30, 38))
    expect(name).toBe('mimetype')
    const content = new TextDecoder().decode(bytes.slice(38, 58))
    expect(content).toBe('application/epub+zip')
  })

  it('重打包结果可被 JSZip 重新打开且内容完整', async () => {
    const data = await buildTestEpub()
    const book = await unpackEPUB(data)
    const bytes = await repackEPUB(book, new Map())
    const reloaded = await JSZip.loadAsync(bytes)
    expect(reloaded.file('OEBPS/ch1.xhtml')).not.toBeNull()
    expect(reloaded.file('META-INF/container.xml')).not.toBeNull()
    const ch1 = await reloaded.file('OEBPS/ch1.xhtml')!.async('string')
    expect(ch1).toBe(CHAPTER1_XHTML)
  })
})

describe('pipeline', () => {
  it('全部规则关闭时输出与输入一致', async () => {
    const data = await buildTestEpub()
    const book = await unpackEPUB(data)
    const result = processBook(book, allOff())
    expect(result.modified.size).toBe(0)
  })

  it('全部规则开启时产生结构与样式改动', async () => {
    const data = await buildTestEpub()
    const book = await unpackEPUB(data)
    const result = processBook(book, defaultSettings)
    const ch1 = result.modified.get('OEBPS/ch1.xhtml')
    expect(ch1).toBeDefined()
    expect(ch1).toContain('fx-root')
    expect(ch1).toContain('fx-anchor')
    expect(ch1).toContain('◇　◇　◇')
    expect(result.changes.map((c) => c.rule)).toEqual(
      expect.arrayContaining([
        'normalizePunct',
        'dialogue',
        'splitLong',
        'sceneBreak',
        'firstSentence',
        'injectCss',
      ]),
    )
  })

  it('单项规则可独立生效', () => {
    const s = allOff()
    s.sceneBreak.enabled = true
    const { output } = processChapterText(
      CHAPTER1_XHTML,
      null,
      'ch1',
      s,
    )
    expect(output).toContain('◇　◇　◇')
    expect(output).not.toContain('fx-anchor')
    expect(output).not.toContain('fx-style')
  })
})
