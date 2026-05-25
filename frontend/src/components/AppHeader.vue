<script setup>
defineProps({
  activeView: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["change-view", "add-transaction"]);
</script>

<template>
  <header class="topbar">
    <div class="brand">
      <p class="eyebrow">Personal Ledger</p>
      <h1>个人记账</h1>
    </div>
    <div class="topbar-actions">
      <nav class="tabs" aria-label="主导航">
        <button class="tab" :class="{ 'is-active': activeView === 'dashboard' }" @click="emit('change-view', 'dashboard')">总览</button>
        <button class="tab" :class="{ 'is-active': activeView === 'transactions' }" @click="emit('change-view', 'transactions')">流水</button>
        <button class="tab" :class="{ 'is-active': activeView === 'schedules' }" @click="emit('change-view', 'schedules')">定时</button>
        <button class="tab" :class="{ 'is-active': activeView === 'accounts' }" @click="emit('change-view', 'accounts')">账户</button>
      </nav>
      <button class="primary-button" @click="emit('add-transaction')">新增流水</button>
    </div>
  </header>
</template>
