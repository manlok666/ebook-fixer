import JSZip from 'jszip'
import type { Chapter, EpubBook } from '../types'

function resolvePath(baseDir: string, rel: string): string {
  const parts = (baseDir ? baseDir.split('/') : []).filter(Boolean)
  for (const seg of rel.split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') parts.pop()
    else parts.push(seg)
  }
  return parts.join('/')
}

function parseXml(text: string, label: string, warnings: string[]): Document | null {
  const doc = new DOMParser().parseFromString(text, 'application/xml')
  const err = doc.querySelector('parsererror')
  if (err) {
    warnings.push(`${label} 解析失败：${err.textContent?.slice(0, 80) ?? 'unknown'}`)
    return null
  }
  return doc
}

export async function unpackEPUB(data: ArrayBuffer | Uint8Array): Promise<EpubBook> {
  const zip = await JSZip.loadAsync(data)
  const warnings: string[] = []
  const entries: string[] = []
  zip.forEach((path) => entries.push(path))

  const containerFile = zip.file('META-INF/container.xml')
  if (!containerFile) throw new Error('不是有效的 EPUB：缺少 META-INF/container.xml')
  const containerText = await containerFile.async('string')
  const containerDoc = parseXml(containerText, 'container.xml', warnings)
  const rootfile = containerDoc?.getElementsByTagName('rootfile')[0]
  const opfPath = rootfile?.getAttribute('full-path') ?? ''
  if (!opfPath || !zip.file(opfPath)) throw new Error('不是有效的 EPUB：找不到 OPF 文件')

  const opfText = await zip.file(opfPath)!.async('string')
  const opfDoc = parseXml(opfText, 'content.opf', warnings)
  if (!opfDoc) throw new Error('不是有效的 EPUB：OPF 解析失败')

  const opfDir = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/')) : ''
  const manifestPaths = new Map<string, string>()
  const manifestHrefs = new Map<string, string>()
  for (const item of Array.from(opfDoc.getElementsByTagName('manifest')[0]?.getElementsByTagName('item') ?? [])) {
    const id = item.getAttribute('id')
    const href = item.getAttribute('href')
    if (id && href) {
      manifestPaths.set(id, resolvePath(opfDir, href.split('#')[0]))
      manifestHrefs.set(id, href.split('#')[0])
    }
  }

  const chapters: Chapter[] = []
  const spineItems = Array.from(opfDoc.getElementsByTagName('spine')[0]?.getElementsByTagName('itemref') ?? [])
  for (const itemref of spineItems) {
    const idref = itemref.getAttribute('idref') ?? ''
    const path = manifestPaths.get(idref)
    if (!path) continue
    const file = zip.file(path)
    if (!file) {
      warnings.push(`章节文件缺失：${path}`)
      continue
    }
    const text = await file.async('string')
    const xmlDecl = text.trimStart().startsWith('<?xml') ? text.slice(0, text.indexOf('?>') + 2) : null
    chapters.push({ path, href: manifestHrefs.get(idref) ?? path, id: idref, text, xmlDecl })
  }
  if (chapters.length === 0) throw new Error('不是有效的 EPUB：spine 中没有可处理的章节')

  const title =
    opfDoc.getElementsByTagName('dc:title')[0]?.textContent?.trim() ||
    opfDoc.getElementsByTagName('title')[0]?.textContent?.trim() ||
    '未命名书籍'

  return { zip, entries, opfPath, title, chapters, warnings }
}
