<script setup lang="ts">
import { useSettings } from '../composables/useSettings'

const { settings, reset } = useSettings()
</script>

<template>
  <div class="rule-panel card">
    <div class="panel-head">
      <h2 class="heading-small">修复规则</h2>
      <button class="pill pill-secondary reset-btn" @click="reset">重置</button>
    </div>

    <div class="rule">
      <label class="rule-toggle">
        <input v-model="settings.splitLong.enabled" type="checkbox" />
        <span class="rule-name">长段智能拆分</span>
      </label>
      <template v-if="settings.splitLong.enabled">
        <div class="rule-control">
          <div class="control-label">
            段落目标字数 <strong>{{ settings.splitLong.targetLength }}</strong>
          </div>
          <input v-model.number="settings.splitLong.targetLength" type="range" min="100" max="400" step="10" />
        </div>
      </template>
    </div>

    <div class="rule">
      <label class="rule-toggle">
        <input v-model="settings.dialogue.enabled" type="checkbox" />
        <span class="rule-name">对话独立成段</span>
      </label>
    </div>

    <div class="rule">
      <div class="rule-name static">首句锚点</div>
      <div class="pill-group">
        <button
          v-for="opt in ([
            { value: 'bold', label: '加粗' },
            { value: 'highlight', label: '高亮' },
            { value: 'off', label: '关闭' },
          ] as const)"
          :key="opt.value"
          class="pill pill-chip"
          :class="{ active: settings.firstSentence.mode === opt.value }"
          @click="settings.firstSentence.mode = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="rule">
      <label class="rule-toggle">
        <input v-model="settings.typography.enabled" type="checkbox" />
        <span class="rule-name">阅读排版注入</span>
      </label>
      <template v-if="settings.typography.enabled">
        <div class="rule-control">
          <div class="control-label">
            行距 <strong>{{ settings.typography.lineHeight.toFixed(1) }}</strong>
          </div>
          <input v-model.number="settings.typography.lineHeight" type="range" min="1.5" max="2.2" step="0.1" />
        </div>
        <div class="rule-control">
          <div class="control-label">
            段间距 <strong>{{ settings.typography.paragraphGap.toFixed(1) }}em</strong>
          </div>
          <input v-model.number="settings.typography.paragraphGap" type="range" min="0" max="1.5" step="0.1" />
        </div>
        <div class="rule-control">
          <div class="control-label">
            每行字数 <strong>{{ settings.typography.maxLineChars }}</strong>
          </div>
          <input v-model.number="settings.typography.maxLineChars" type="range" min="25" max="38" step="1" />
        </div>
        <div class="rule-control">
          <div class="control-label">首行缩进</div>
          <div class="pill-group">
            <button
              class="pill pill-chip"
              :class="{ active: settings.typography.indent === 'em2' }"
              @click="settings.typography.indent = 'em2'"
            >
              2 字符
            </button>
            <button
              class="pill pill-chip"
              :class="{ active: settings.typography.indent === 'none' }"
              @click="settings.typography.indent = 'none'"
            >
              无缩进
            </button>
          </div>
        </div>
      </template>
    </div>

    <div class="rule">
      <label class="rule-toggle">
        <input v-model="settings.sceneBreak.enabled" type="checkbox" />
        <span class="rule-name">场景分隔符</span>
      </label>
    </div>

    <div class="rule">
      <label class="rule-toggle">
        <input v-model="settings.normalizePunct.enabled" type="checkbox" />
        <span class="rule-name">标点规范化</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.rule-panel {
  padding: calc(24px * var(--site-space, 1));
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reset-btn {
  padding: 6px 12px;
  font-size: 12px;
}

.rule {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.rule-toggle input {
  width: 18px;
  height: 18px;
  accent-color: var(--uber-black);
}

.rule-name {
  font-size: 15px;
  font-weight: 500;
}

.rule-name.static {
  cursor: default;
}

.rule-control {
  padding-left: 28px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  font-size: 13px;
  color: var(--body-gray);
}

.pill-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pill-group .pill {
  padding: 8px 14px;
  font-size: 13px;
}
</style>
