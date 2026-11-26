import { markRaw, reactive, watch } from 'vue'
import { unpackEPUB } from '../engine/epub/unpack'
import { repackEPUB } from '../engine/epub/repack'
import { processBook } from '../engine/pipeline'
import type { ChangeEntry, EpubBook } from '../engine/types'
import { useSettings } from './useSettings'

interface ProjectState {
  book: EpubBook | null
  modified: Map<string, string>
  changes: ChangeEntry[]
  warnings: string[]
  loading: boolean
  processing: boolean
  error: string | null
  chapterIndex: number
  generation: number
}

const state = reactive<ProjectState>({
  book: null,
  modified: new Map(),
  changes: [],
  warnings: [],
  loading: false,
  processing: false,
  error: null,
  chapterIndex: 0,
  generation: 0,
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let bytesCache: { generation: number; bytes: Uint8Array } | null = null

function reprocess() {
  if (!state.book) return
  state.processing = true
  const result = processBook(state.book, useSettings().settings)
  state.modified = result.modified
  state.changes = result.changes
  state.warnings = result.warnings
  state.generation += 1
  state.processing = false
}

function scheduleReprocess() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    reprocess()
  }, 300)
}

watch(() => useSettings().settings, scheduleReprocess, { deep: true })

export function useProject() {
  async function loadFile(file: File) {
    state.loading = true
    state.error = null
    try {
      const data = await file.arrayBuffer()
      const book = await unpackEPUB(data)
      book.zip = markRaw(book.zip)
      state.book = book
      state.chapterIndex = 0
      reprocess()
    } catch (err) {
      state.book = null
      state.error = err instanceof Error ? err.message : '文件解析失败'
    } finally {
      state.loading = false
    }
  }

  async function processedBytes(): Promise<Uint8Array> {
    if (!state.book) throw new Error('尚未加载书籍')
    if (bytesCache && bytesCache.generation === state.generation) return bytesCache.bytes
    const bytes = await repackEPUB(state.book, state.modified)
    bytesCache = { generation: state.generation, bytes }
    return bytes
  }

  function chapterText(path: string): string {
    return state.modified.get(path) ?? state.book?.chapters.find((c) => c.path === path)?.text ?? ''
  }

  async function exportEpub() {
    if (!state.book) return
    const bytes = await processedBytes()
    const blob = new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'application/epub+zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${state.book.title || 'book'}-fixed.epub`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    state,
    loadFile,
    chapterText,
    processedBytes,
    exportEpub,
    selectChapter(index: number) {
      state.chapterIndex = index
    },
  }
}
