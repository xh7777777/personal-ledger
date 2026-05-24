<script setup>
import { rangeOptions } from "../../constants/ledger";

defineProps({
  state: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="panel toolbar-panel">
    <div class="segmented" aria-label="时间筛选">
      <button v-for="range in rangeOptions" :key="range.value" class="segment" :class="{ 'is-active': state.activeRange === range.value }" @click="state.activeRange = range.value">
        {{ range.label }}
      </button>
    </div>
    <div v-show="state.activeRange === 'custom'" class="custom-range">
      <label><span>开始</span><input v-model="state.customStart" type="date" /></label>
      <label><span>结束</span><input v-model="state.customEnd" type="date" /></label>
    </div>
  </div>
</template>
