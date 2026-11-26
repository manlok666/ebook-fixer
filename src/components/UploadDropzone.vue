<script setup lang="ts">
import { ref } from 'vue'
import { useProject } from '../composables/useProject'

const { loadFile, state } = useProject()
const dragging = ref(false)
const inputRef = ref<HTMLInputElement>()

function onFiles(files: FileList | null) {
  const file = files?.[0]
  if (file) loadFile(file)
}

function onDrop(e: DragEvent) {
  dragging.value = false
  onFiles(e.dataTransfer?.files ?? null)
}
</script>

<template>
  <div
    class="dropzone card"
    :class="{ dragging }"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
    @click="inputRef?.click()"
  >
    <input
      ref="inputRef"
      class="file-input"
      type="file"
      accept=".epub,application/epub+zip"
      @change="onFiles(($event.target as HTMLInputElement).files)"
    />
    <div class="dropzone-title">上传 EPUB</div>
    <div class="dropzone-hint text-secondary">
      {{ state.loading ? '解析中…' : '拖放文件到此处，或点击选择' }}
    </div>
    <div v-if="state.error" class="dropzone-error">{{ state.error }}</div>
    <div class="dropzone-note text-muted">文件仅在浏览器内处理，不会上传到任何服务器</div>
  </div>
</template>

<style scoped>
.file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.dropzone {
  padding: calc(24px * var(--site-space, 1));
  text-align: center;
  cursor: pointer;
  border: 1px dashed var(--site-border);
  transition: background calc(180ms * var(--site-motion, 1)) ease;
}

.dropzone:hover,
.dropzone.dragging {
  background: var(--hover-light);
}

.dropzone-title {
  font-size: 18px;
  font-weight: 700;
}

.dropzone-hint {
  margin-top: 8px;
  font-size: 14px;
}

.dropzone-error {
  margin-top: 8px;
  font-size: 13px;
  color: var(--uber-black);
  background: var(--chip-gray);
  border-radius: var(--site-radius);
  padding: 6px 10px;
}

.dropzone-note {
  margin-top: 12px;
  font-size: 12px;
}
</style>
