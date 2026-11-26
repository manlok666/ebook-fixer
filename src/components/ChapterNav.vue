<script setup lang="ts">
import { useProject } from '../composables/useProject'

const { state, selectChapter } = useProject()
</script>

<template>
  <div class="chapter-nav card">
    <div class="heading-small nav-title">章节</div>
    <div class="chapter-list">
      <button
        v-for="(chapter, i) in state.book?.chapters ?? []"
        :key="chapter.path"
        class="chapter-item"
        :class="{ active: i === state.chapterIndex }"
        @click="selectChapter(i)"
      >
        <span class="chapter-index text-muted">{{ i + 1 }}</span>
        <span class="chapter-name">{{ chapter.href.split('/').pop() }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.chapter-nav {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 320px;
}

.nav-title {
  padding: 0 4px;
}

.chapter-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chapter-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: none;
  border-radius: var(--site-radius);
  background: transparent;
  font-family: var(--font-body);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  color: var(--uber-black);
}

.chapter-item:hover {
  background: var(--hover-light);
}

.chapter-item.active {
  background: var(--uber-black);
  color: var(--pure-white);
}

.chapter-item.active .chapter-index {
  color: var(--muted-gray);
}

.chapter-index {
  font-size: 11px;
  min-width: 18px;
}

.chapter-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
