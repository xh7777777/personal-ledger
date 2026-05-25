<script setup>
defineProps({
  accountName: {
    type: Function,
    required: true
  },
  money: {
    type: Function,
    required: true
  },
  transactions: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(["view-all"]);
</script>

<template>
  <section class="panel">
    <div class="section-heading">
      <div>
        <h2>最近流水</h2>
        <p>最近 8 条收入与支出</p>
      </div>
      <button class="ghost-button" @click="emit('view-all')">查看全部</button>
    </div>
    <div v-if="!transactions.length" class="empty-state compact">还没有流水，点击右上角新增第一笔记录</div>
    <div v-else class="recent-list">
      <div v-for="transaction in transactions" :key="transaction.id" class="recent-item">
        <div class="recent-main">
          <div class="recent-title" :title="`${transaction.category || '未分类'}${transaction.target ? ` · ${transaction.target}` : ''}`">
            <span class="category-icon-badge" :class="`tone-${transaction.categoryMeta.tone}`">{{ transaction.categoryMeta.icon }}</span>
            <span>{{ transaction.categoryMeta.name }}</span><span v-if="transaction.target"> · {{ transaction.target }}</span>
          </div>
          <div class="recent-meta">{{ transaction.date }} · {{ accountName(transaction.accountId) }}<span v-if="transaction.note"> · {{ transaction.note }}</span></div>
        </div>
        <div class="recent-amount" :class="transaction.type === 'income' ? 'positive' : 'negative'">{{ transaction.type === "income" ? "+" : "-" }}{{ money(transaction.amount) }}</div>
      </div>
    </div>
  </section>
</template>
