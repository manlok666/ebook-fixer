const NAMED_ENTITIES: Record<string, string> = {
  nbsp: '&#160;',
  mdash: '&#8212;',
  ndash: '&#8211;',
  hellip: '&#8230;',
  ldquo: '&#8220;',
  rdquo: '&#8221;',
  lsquo: '&#8216;',
  rsquo: '&#8217;',
  laquo: '&#171;',
  raquo: '&#187;',
  middot: '&#183;',
  bull: '&#8226;',
  copy: '&#169;',
  reg: '&#174;',
  trade: '&#8482;',
  deg: '&#176;',
  sect: '&#167;',
  para: '&#182;',
  times: '&#215;',
  divide: '&#247;',
  plusmn: '&#177;',
  frac12: '&#189;',
  sup2: '&#178;',
  sup3: '&#179;',
  micro: '&#181;',
  ordf: '&#186;',
  ordm: '&#187;',
}

function sanitizeEntities(text: string): string {
  return text.replace(/&([a-zA-Z]+);/g, (match, name: string) => {
    if (name === 'amp' || name === 'lt' || name === 'gt' || name === 'quot' || name === 'apos') return match
    return NAMED_ENTITIES[name] ?? `&amp;${name};`
  })
}

export interface ParsedChapter {
  doc: Document
  warning: string | null
}

export function parseXHTML(text: string, label: string): ParsedChapter {
  const parser = new DOMParser()
  const attempt = (source: string): Document | null => {
    const doc = parser.parseFromString(source, 'application/xhtml+xml')
    return doc.querySelector('parsererror') ? null : doc
  }
  const direct = attempt(text)
  if (direct) return { doc: direct, warning: null }
  const cleaned = attempt(sanitizeEntities(text))
  if (cleaned) return { doc: cleaned, warning: `${label}：已修复不规范实体` }
  const fallback = parser.parseFromString(sanitizeEntities(text), 'text/html')
  return { doc: fallback, warning: `${label}：XHTML 解析失败，已降级为 HTML 处理` }
}

export function serializeXHTML(doc: Document, xmlDecl: string | null): string {
  const body = new XMLSerializer().serializeToString(doc)
  // Chrome 的 XMLSerializer 会自带 <?xml?> 声明，jsdom 不会；重复声明会使 XML 非法
  if (!xmlDecl || body.trimStart().startsWith('<?xml')) return body
  return `${xmlDecl}\n${body}`
}
