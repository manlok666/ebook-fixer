import JSZip from 'jszip'
import type { EpubBook } from '../types'

export async function repackEPUB(
  book: EpubBook,
  modified: Map<string, string>,
): Promise<Uint8Array> {
  const out = new JSZip()
  out.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
  for (const path of book.entries) {
    if (path === 'mimetype') continue
    const replaced = modified.get(path)
    if (replaced !== undefined) {
      out.file(path, replaced, { compression: 'DEFLATE' })
    } else {
      const entry = book.zip.file(path)
      if (!entry) continue
      const bytes = await entry.async('uint8array')
      out.file(path, bytes, { compression: 'DEFLATE' })
    }
  }
  return out.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
}
