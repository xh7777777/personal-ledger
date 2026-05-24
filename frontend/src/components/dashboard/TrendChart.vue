<script setup>
defineProps({
  money: {
    type: Function,
    required: true
  },
  rows: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <article class="panel chart-panel">
    <div class="section-heading">
      <div>
        <h2>收支趋势</h2>
        <p>按当前时间范围聚合</p>
      </div>
    </div>
    <div class="trend-chart">
      <div v-for="item in rows" :key="item.label" class="trend-column" :title="`${item.label} 收入 ${money(item.income)} 支出 ${money(item.expense)}`">
        <div class="bar-stack">
          <div class="bar income" :style="{ height: item.incomeHeight }"></div>
          <div class="bar expense" :style="{ height: item.expenseHeight }"></div>
        </div>
        <div class="bar-label">{{ item.label }}</div>
      </div>
    </div>
  </article>
</template>
