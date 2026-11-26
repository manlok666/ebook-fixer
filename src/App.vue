<script setup lang="ts">
import { computed } from 'vue'
import UploadDropzone from './components/UploadDropzone.vue'
import RulePanel from './components/RulePanel.vue'
import ChapterNav from './components/ChapterNav.vue'
import DiffViewer from './components/DiffViewer.vue'
import EpubReader from './components/EpubReader.vue'
import ExportBar from './components/ExportBar.vue'
import { useProject } from './composables/useProject'
import { usePreview } from './composables/usePreview'

const { state } = useProject()
const preview = usePreview()
const hasBook = computed(() => !!state.book)
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">ebook-fixer</div>
      <div class="topbar-note text-secondary">中文译本 EPUB 可读性修复 · 纯浏览器端处理</div>
      <ExportBar v-if="hasBook" />
    </header>

    <main class="workspace">
      <aside class="sidebar">
        <UploadDropzone v-if="!hasBook" />
        <ChapterNav v-if="hasBook" />
        <RulePanel />
      </aside>

      <section class="content">
        <template v-if="hasBook">
          <div class="tabs">
            <button
              class="pill pill-chip"
              :class="{ active: preview.state.tab === 'diff' }"
              @click="preview.setTab('diff')"
            >
              对照预览
            </button>
            <button
              class="pill pill-chip"
              :class="{ active: preview.state.tab === 'read' }"
              @click="preview.setTab('read')"
            >
              阅读模式
            </button>
          </div>
          <div class="content-body">
            <DiffViewer v-if="preview.state.tab === 'diff'" />
            <EpubReader v-else />
          </div>
        </template>
        <div v-else class="empty">
          <h1 class="heading-display">读得下去的译本</h1>
          <p class="empty-desc text-secondary">
            上传一本黑压压的中文译本 EPUB，自动拆段、对话独立成段、首句加锚点、注入舒适排版，
            在浏览器里完成，文件不离开你的电脑。
          </p>
          <div class="empty-steps">
            <div class="step card">
              <div class="step-num">1</div>
              <div class="step-title">上传 EPUB</div>
              <div class="step-desc text-secondary">拖放或点击选择文件</div>
            </div>
            <div class="step card">
              <div class="step-num">2</div>
              <div class="step-title">调规则</div>
              <div class="step-desc text-secondary">左侧控件实时生效</div>
            </div>
            <div class="step card">
              <div class="step-num">3</div>
              <div class="step-title">预览并导出</div>
              <div class="step-desc text-secondary">对照视图 + 仿真阅读</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--uber-black);
}

.brand {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
}

.topbar-note {
  font-size: 13px;
  flex: 1;
}

.workspace {
  flex: 1;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: calc(24px * var(--site-space, 1));
  padding: calc(24px * var(--site-space, 1));
  overflow: hidden;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  overflow: hidden;
}

.tabs {
  display: flex;
  gap: 8px;
}

.content-body {
  flex: 1;
  overflow: hidden;
}

.empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  height: 100%;
  max-width: 720px;
}

.empty-desc {
  font-size: 17px;
  line-height: 1.6;
  margin: 0;
}

.empty-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.step {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--uber-black);
  color: var(--pure-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.step-title {
  font-weight: 700;
  font-size: 15px;
}

.step-desc {
  font-size: 13px;
}

@media (max-width: 1024px) {
  .workspace {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }

  .empty-steps {
    grid-template-columns: 1fr;
  }
}
</style>
