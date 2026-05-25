<script setup>
defineProps({
  ledger: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <section class="view">
    <div class="panel">
      <div class="section-heading">
        <div>
          <h2>账户</h2>
          <p>维护现金、银行卡等本地账户</p>
        </div>
        <button class="secondary-button" @click="ledger.openAccountModal()">新增账户</button>
      </div>
      <div v-if="!ledger.state.accounts.length" class="empty-state compact">至少需要一个账户才能新增流水</div>
      <div v-else class="wallet-strip" aria-label="账户卡片">
        <article v-for="account in ledger.state.accounts" :key="account.id" class="wallet-card" :class="`wallet-${ledger.accountMeta(account.type).tone}`" tabindex="0">
          <div class="wallet-card-top">
            <div class="wallet-brand">
              <span class="wallet-icon">
                <img v-if="ledger.accountMeta(account.type).iconUrl" :src="ledger.accountMeta(account.type).iconUrl" :alt="ledger.accountMeta(account.type).label" />
                <span v-else>{{ ledger.accountMeta(account.type).icon }}</span>
              </span>
              <div>
                <div class="account-name" :title="account.name">{{ account.name }}</div>
                <div class="account-meta">{{ ledger.accountMeta(account.type).label }}<span v-if="account.note"> · {{ account.note }}</span></div>
              </div>
            </div>
          </div>
          <div>
            <div class="wallet-label">当前余额</div>
            <div class="account-balance">{{ ledger.money(account.currentBalance) }}</div>
          </div>
          <div class="wallet-card-bottom">
            <div>
              <div class="wallet-label">初始金额</div>
              <div class="wallet-subvalue">{{ ledger.money(account.initialBalance) }}</div>
            </div>
            <div class="account-actions">
              <button class="wallet-action" @click="ledger.openAccountModal(account)">编辑</button>
              <button class="wallet-action delete" @click="ledger.deleteAccount(account.id)">删除</button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
