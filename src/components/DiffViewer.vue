<script setup lang="ts">
import { computed } from 'vue'
import { useProject } from '../composables/useProject'
import { extractChapterParagraphs, diffParagraphLists, type DiffSpan } from '../engine/diff'

const { state, chapterText } = useProject()

const pairs = computed(() => {
  const book = state.book
  if (!book) return []
  const chapter = book.chapters[state.chapterIndex]
  if (!chapter) return []
  const orig = extractChapterParagraphs(chapter.text, chapter.path)
  const proc = extractChapterParagraphs(chapterText(chapter.path), chapter.path)
  return diffParagraphLists(orig, proc)
})

const changedCount = computed(() => pairs.value.filter((p) => p.changed).length)

function spansHtml(spans: DiffSpan[]): string {
  return spans
    .map((s) =>
      s.changed
        ? `<span class="diff-mark">${escapeHtml(s.text)}</span>`
        : escapeHtml(s.text),
    )
    .join('')
}

function escapeHtml(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
</script>

<template>
  <div class="diff-viewer">
    <div class="diff-status text-secondary">
      <span v-if="state.processing">处理中…</span>
      <span v-else>{{ pairs.length }} 段 · <strong>{{ changedCount }}</strong> 处改动</span>
    </div>
    <div class="diff-columns">
      <div class="diff-col">
        <div class="col-label text-muted">原文</div>
        <div
          v-for="(pair, i) in pairs"
          :key="'l' + i"
          class="diff-para"
          :class="{ changed: pair.changed }"
          v-html="spansHtml(pair.left)"
        />
      </div>
      <div class="diff-col">
        <div class="col-label text-muted">处理后</div>
        <div
          v-for="(pair, i) in pairs"
          :key="'r' + i"
          class="diff-para"
          :class="{ changed: pair.changed }"
          v-html="spansHtml(pair.right)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.diff-viewer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.diff-status {
  font-size: 13px;
}

.diff-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  overflow-y: auto;
  flex: 1;
}

.diff-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.col-label {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.diff-para {
  font-size: 14px;
  line-height: 1.8;
  padding: 10px 12px;
  border-radius: var(--site-radius);
  background: var(--hover-light);
  word-break: break-word;
}

.diff-para.changed {
  background: var(--chip-gray);
  box-shadow: inset 3px 0 0 var(--uber-black);
}

.diff-para :deep(.diff-mark) {
  background: var(--uber-black);
  color: var(--pure-white);
  border-radius: 3px;
  padding: 0 2px;
}

@media (max-width: 900px) {
  .diff-columns {
    grid-template-columns: 1fr;
  }
}
</style>
