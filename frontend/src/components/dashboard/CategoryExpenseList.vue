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
  <article class="panel category-panel">
    <div class="section-heading">
      <div>
        <h2>分类支出</h2>
        <p>支出分类排行</p>
      </div>
    </div>
    <div v-if="!rows.length" class="empty-state compact">当前范围没有支出记录</div>
    <div v-else class="category-list">
      <div v-for="item in rows" :key="item.name" class="category-row">
        <div class="category-row-top">
          <span class="category-label" :title="item.name">
            <span class="category-icon-badge" :class="`tone-${item.tone}`">{{ item.icon }}</span>
            <span class="category-name">{{ item.name }}</span>
          </span>
          <span class="category-amount">{{ money(item.amount) }}</span>
        </div>
        <div class="progress-track"><div class="progress-fill" :style="{ width: item.width }"></div></div>
      </div>
    </div>
  </article>
</template>
