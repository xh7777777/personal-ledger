<script setup>
defineProps({
  accountCount: {
    type: Number,
    required: true
  },
  expenseCount: {
    type: Number,
    required: true
  },
  incomeCount: {
    type: Number,
    required: true
  },
  money: {
    type: Function,
    required: true
  },
  periodExpense: {
    type: Number,
    required: true
  },
  periodIncome: {
    type: Number,
    required: true
  },
  periodNet: {
    type: Number,
    required: true
  },
  rangeLabel: {
    type: String,
    required: true
  },
  totalBalance: {
    type: Number,
    required: true
  }
});
</script>

<template>
  <section class="summary-grid">
    <article class="card balance-card">
      <span class="card-label">账户总金额</span>
      <strong>{{ money(totalBalance) }}</strong>
      <p>{{ accountCount }} 个账户</p>
    </article>
    <article class="card metric-card">
      <span class="card-label">本周期收入</span>
      <strong class="positive">{{ money(periodIncome) }}</strong>
      <p>{{ incomeCount }} 笔收入</p>
    </article>
    <article class="card metric-card">
      <span class="card-label">本周期支出</span>
      <strong class="negative">{{ money(periodExpense) }}</strong>
      <p>{{ expenseCount }} 笔支出</p>
    </article>
    <article class="card metric-card">
      <span class="card-label">本周期净收入</span>
      <strong :class="periodNet >= 0 ? 'positive' : 'negative'">{{ money(periodNet) }}</strong>
      <p>{{ rangeLabel }}</p>
    </article>
  </section>
</template>
