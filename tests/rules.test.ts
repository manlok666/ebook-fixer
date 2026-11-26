import { describe, expect, it } from 'vitest'
import { makeBody, bodyParas, buildLongParagraph } from './fixtures'
import { normalizePunct } from '../src/engine/rules/normalizePunct'
import { splitDialogue } from '../src/engine/rules/splitDialogue'
import { splitLongParagraph } from '../src/engine/rules/splitLongParagraph'
import { sceneSeparator } from '../src/engine/rules/sceneSeparator'
import { firstSentence } from '../src/engine/rules/firstSentence'
import { scanQuotes, normalizeQuotesText } from '../src/engine/text/quote'
import { splitSentences } from '../src/engine/text/sentence'

describe('text/sentence', () => {
  it('按句末标点切分，保留尾随引号', () => {
    const text = '他说：“你好。”然后走了。'
    const spans = splitSentences(text)
    expect(spans.map((s) => text.slice(s.start, s.end))).toEqual(['他说：“你好。”', '然后走了。'])
  })

  it('省略号视为句末', () => {
    const text = '他沉默了……她也沉默了。'
    const spans = splitSentences(text)
    expect(spans).toHaveLength(2)
    expect(text.slice(spans[0].start, spans[0].end)).toBe('他沉默了……')
  })
})

describe('text/quote', () => {
  it('识别最外层引号范围', () => {
    const text = '他说：“你好。”然后走了。'
    const spans = scanQuotes(text)
    expect(spans).toHaveLength(1)
    expect(text.slice(spans[0].start, spans[0].end)).toBe('“你好。”')
  })

  it('识别直角引号', () => {
    const spans = scanQuotes('他说：「你好。」然后走了。')
    expect(spans).toHaveLength(1)
  })

  it('未闭合引号以文末兜底', () => {
    const spans = scanQuotes('他说：“你好。')
    expect(spans).toHaveLength(1)
    expect(spans[0].end).toBe('他说：“你好。'.length)
  })

  it('直引号统一为弯引号，直角引号保留', () => {
    expect(normalizeQuotesText('「你好」')).toBe('「你好」')
    expect(normalizeQuotesText('"你好"')).toBe('“你好”')
  })
})

describe('rules/normalizePunct', () => {
  it('省略号、破折号归一，直角引号保留', () => {
    const body = makeBody(['他说。。。然后走了...', '他说--走了—', '「你好」', '"你好"'])
    normalizePunct(body)
    expect(bodyParas(body)).toEqual(['他说……然后走了……', '他说——走了——', '「你好」', '“你好”'])
  })
})

describe('rules/splitDialogue', () => {
  it('直角引号对话连同提示语独立成段', () => {
    const body = makeBody(['他看着窗外的景色，心情十分复杂。「你到底是谁？」他问道。'])
    splitDialogue(body)
    expect(bodyParas(body)).toEqual(['他看着窗外的景色，心情十分复杂。', '「你到底是谁？」他问道。'])
  })

  it('前置提示语并入对话段', () => {
    const body = makeBody(['他说：「你好。」然后走了。'])
    splitDialogue(body)
    expect(bodyParas(body)).toEqual(['他说：「你好。」', '然后走了。'])
  })

  it('双引号不作为拆段依据', () => {
    const body = makeBody(['他看着窗外的景色，心情十分复杂。“你到底是谁？”他问道。'])
    splitDialogue(body)
    expect(bodyParas(body)).toEqual(['他看着窗外的景色，心情十分复杂。“你到底是谁？”他问道。'])
  })

  it('术语强调的双引号不拆段', () => {
    const body = makeBody(['他提到了“存在与时间”这个书名，然后陷入了沉思。'])
    splitDialogue(body)
    expect(bodyParas(body)).toEqual(['他提到了“存在与时间”这个书名，然后陷入了沉思。'])
  })

  it('无对话段落保持不变', () => {
    const body = makeBody(['这是一个没有对话的普通段落。'])
    splitDialogue(body)
    expect(bodyParas(body)).toEqual(['这是一个没有对话的普通段落。'])
  })
})

describe('rules/splitLongParagraph', () => {
  it('超长段落被拆分为多段', () => {
    const long = buildLongParagraph()
    expect(long.length).toBeGreaterThan(350)
    const body = makeBody([long])
    splitLongParagraph(body, 200)
    const paras = bodyParas(body)
    expect(paras.length).toBeGreaterThanOrEqual(2)
    expect(paras.join('')).toBe(long)
  })

  it('短段落保持不变', () => {
    const body = makeBody(['短段落不需要处理。'])
    splitLongParagraph(body, 200)
    expect(bodyParas(body)).toEqual(['短段落不需要处理。'])
  })
})

describe('rules/sceneSeparator', () => {
  it('星号行统一为居中分隔符', () => {
    const body = makeBody(['＊＊＊', '正常段落'])
    sceneSeparator(body)
    const paras = bodyParas(body)
    expect(paras[0]).toBe('◇　◇　◇')
    expect(paras[1]).toBe('正常段落')
  })
})

describe('rules/firstSentence', () => {
  it('长段落首句加粗', () => {
    const long = buildLongParagraph(3)
    const body = makeBody([long])
    firstSentence(body, 'bold')
    const p = body.getElementsByTagName('p')[0]
    const anchor = p.querySelector('strong.fx-anchor')
    expect(anchor).not.toBeNull()
    expect(anchor!.textContent).toBe('他在房间里走来走去，心里反复想着这件事，窗外的天色渐渐暗了下来。')
  })

  it('短段落不加锚点', () => {
    const body = makeBody(['短段落。'])
    firstSentence(body, 'bold')
    expect(body.getElementsByTagName('p')[0].querySelector('strong')).toBeNull()
  })
})
