export function getFullText(el: Element): string {
  return el.textContent ?? ''
}

function textLen(node: Node): number {
  return node.textContent?.length ?? 0
}

function cloneRange(node: Node, s: number, e: number): Node | null {
  const doc = node.ownerDocument!
  if (node.nodeType === Node.TEXT_NODE) {
    const t = (node.nodeValue ?? '').slice(s, e)
    return t ? doc.createTextNode(t) : null
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null
  const el = (node.cloneNode(false) as Element)
  let pos = 0
  for (const child of Array.from(node.childNodes)) {
    const len = textLen(child)
    const cs = pos
    const ce = pos + len
    pos = ce
    if (ce <= s || cs >= e) continue
    const frag = cloneRange(child, Math.max(0, s - cs), Math.min(len, e - cs))
    if (frag) el.appendChild(frag)
  }
  return el.childNodes.length > 0 ? el : null
}

export function splitParagraphAtOffsets(p: Element, offsets: number[]): Element[] {
  const text = getFullText(p)
  const cuts = [...new Set(offsets)].filter((o) => o > 0 && o < text.length).sort((a, b) => a - b)
  if (cuts.length === 0) return [p]
  const segments: [number, number][] = []
  let prev = 0
  for (const c of cuts) {
    segments.push([prev, c])
    prev = c
  }
  segments.push([prev, text.length])
  const results: Element[] = []
  for (const [s, e] of segments) {
    const frag = cloneRange(p, s, e)
    if (frag && frag.nodeType === Node.ELEMENT_NODE) results.push(frag as Element)
    else if (frag) {
      const holder = p.cloneNode(false) as Element
      holder.appendChild(frag)
      results.push(holder)
    }
  }
  return results.length > 0 ? results : [p]
}

export function wrapTextRange(
  p: Element,
  start: number,
  end: number,
  make: (doc: Document) => Element,
): void {
  const targets: [Text, number, number][] = []
  let pos = 0
  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const len = child.nodeValue?.length ?? 0
        const cs = pos
        const ce = pos + len
        pos = ce
        const os = Math.max(start, cs)
        const oe = Math.min(end, ce)
        if (os < oe) targets.push([child as Text, os - cs, oe - cs])
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child)
      }
    }
  }
  walk(p)
  for (const [textNode, ls, le] of targets) {
    const parent = textNode.parentNode
    if (!parent) continue
    const full = textNode.nodeValue ?? ''
    const parts: Node[] = []
    const doc = p.ownerDocument
    if (ls > 0) parts.push(doc.createTextNode(full.slice(0, ls)))
    const wrapper = make(doc)
    wrapper.textContent = full.slice(ls, le)
    parts.push(wrapper)
    if (le < full.length) parts.push(doc.createTextNode(full.slice(le)))
    for (const part of parts) parent.insertBefore(part, textNode)
    parent.removeChild(textNode)
  }
}

export function bodyOf(doc: Document): Element | null {
  return doc.getElementsByTagName('body')[0] ?? null
}

export function paragraphsOf(body: Element): Element[] {
  return Array.from(body.getElementsByTagName('p'))
}
