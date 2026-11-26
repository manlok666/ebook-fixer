<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type ePubType from 'epubjs'
import { useProject } from '../composables/useProject'

type Book = ReturnType<typeof ePubType>
type Rendition = ReturnType<Book['renderTo']>

const { state, processedBytes } = useProject()
const container = ref<HTMLDivElement>()
let book: Book | null = null
let rendition: Rendition | null = null
let renderToken = 0

async function render() {
  if (!container.value || !state.book) return
  const token = ++renderToken
  try {
    const bytes = await processedBytes()
    if (token !== renderToken) return
    rendition?.destroy()
    book?.destroy()
    const { default: ePub } = await import('epubjs')
    if (token !== renderToken) return
    book = ePub(bytes.slice().buffer)
    rendition = book.renderTo(container.value, {
      width: '100%',
      height: '100%',
      flow: 'paginated',
    })
    rendition.themes.default({
      'font-family': 'serif',
    })
    const chapter = state.book.chapters[state.chapterIndex]
    await rendition.display(chapter?.href)
  } catch (err) {
    console.error('epub 渲染失败', err)
  }
}

onMounted(render)
watch(
  () => [state.chapterIndex, state.generation],
  () => {
    render()
  },
)
onBeforeUnmount(() => {
  rendition?.destroy()
  book?.destroy()
})
</script>

<template>
  <div class="epub-reader">
    <div class="reader-toolbar">
      <button class="pill pill-secondary" @click="rendition?.prev()">上一页</button>
      <span class="reader-title text-secondary">{{ state.book?.title }}</span>
      <button class="pill pill-secondary" @click="rendition?.next()">下一页</button>
    </div>
    <div ref="container" class="reader-frame card" />
  </div>
</template>

<style scoped>
.epub-reader {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.reader-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.reader-title {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reader-frame {
  flex: 1;
  min-height: 480px;
  overflow: hidden;
}
</style>
