<script setup lang="ts">
import { useProject } from '../composables/useProject'

const { exportEpub, state } = useProject()
</script>

<template>
  <button class="pill pill-primary" :disabled="!state.book || state.processing" @click="exportEpub">
    导出 EPUB
  </button>
</template>

<style scoped>
button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
