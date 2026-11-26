import JSZip from 'jszip'

export function buildLongParagraph(sentences = 14): string {
  const units = [
    '他在房间里走来走去，心里反复想着这件事，窗外的天色渐渐暗了下来。',
    '后来他又想起了多年前的那个下午，一切都历历在目，仿佛从未走远。',
    '但事情已经无法挽回，他只能默默承受这个结果，等待命运的下一次安排。',
  ]
  let out = ''
  for (let i = 0; i < sentences; i++) out += units[i % units.length]
  return out
}

export const CHAPTER1_XHTML = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>第一章</title></head>
<body>
<p>${buildLongParagraph()}</p>
<p>他看着窗外的景色，心情十分复杂。「你到底是谁？」他问道。</p>
<p>他说。。。然后走了...</p>
<p>“引用的术语”不应该触发拆段。</p>
<p>＊＊＊</p>
</body>
</html>`

export const CHAPTER2_XHTML = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>第二章</title></head>
<body>
<p>短段落不需要处理。</p>
</body>
</html>`

export async function buildTestEpub(): Promise<Uint8Array> {
  const zip = new JSZip()
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
  )
  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>测试书</dc:title>
    <dc:identifier id="uid">test-book-1</dc:identifier>
    <dc:language>zh</dc:language>
  </metadata>
  <manifest>
    <item id="ch1" href="ch1.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch2" href="ch2.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="ch1"/>
    <itemref idref="ch2"/>
  </spine>
</package>`,
  )
  zip.file('OEBPS/ch1.xhtml', CHAPTER1_XHTML)
  zip.file('OEBPS/ch2.xhtml', CHAPTER2_XHTML)
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
}

export function makeDoc(xhtml: string): Document {
  return new DOMParser().parseFromString(xhtml, 'application/xhtml+xml')
}

export function makeBody(paragraphs: string[]): Element {
  const doc = makeDoc(
    `<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>${paragraphs
      .map((p) => `<p>${p}</p>`)
      .join('')}</body></html>`,
  )
  return doc.getElementsByTagName('body')[0]
}

export function bodyParas(body: Element): string[] {
  return Array.from(body.getElementsByTagName('p')).map((p) => p.textContent ?? '')
}
