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
          <h2>流水管理</h2>
          <p>筛选、编辑和删除每一笔记录</p>
        </div>
        <button class="secondary-button" @click="ledger.openTransactionModal()">新增流水</button>
      </div>
      <div class="filters">
        <label>
          <span>类型</span>
          <select v-model="ledger.state.filters.type">
            <option value="all">全部</option>
            <option value="income">收入</option>
            <option value="expense">支出</option>
          </select>
        </label>
        <label>
          <span>账户</span>
          <select v-model="ledger.state.filters.accountId">
            <option value="all">全部账户</option>
            <option v-for="account in ledger.state.accounts" :key="account.id" :value="account.id">{{ account.name }}</option>
          </select>
        </label>
        <label><span>关键词</span><input v-model="ledger.state.filters.keyword" type="search" placeholder="分类、对象、备注" /></label>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>日期</th><th>类型</th><th>金额</th><th>账户</th><th>分类</th><th>对象/用途</th><th>备注</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-if="!ledger.filteredTransactions.length"><td colspan="8"><div class="empty-state compact">没有匹配的流水</div></td></tr>
            <tr v-for="transaction in ledger.filteredTransactions" :key="transaction.id">
              <td>{{ transaction.date }}</td>
              <td>{{ transaction.type === "income" ? "收入" : "支出" }}</td>
              <td :class="transaction.type === 'income' ? 'positive' : 'negative'">{{ ledger.money(transaction.amount) }}</td>
              <td><span class="cell-text" :title="ledger.accountName(transaction.accountId)">{{ ledger.accountName(transaction.accountId) }}</span></td>
              <td><span class="cell-text" :title="transaction.category">{{ transaction.category }}</span></td>
              <td><span class="cell-text" :title="transaction.target">{{ transaction.target || "-" }}</span></td>
              <td><span class="cell-text" :title="transaction.note">{{ transaction.note || "-" }}</span></td>
              <td>
                <div class="row-actions">
                  <button class="text-button" @click="ledger.openTransactionModal(transaction)">编辑</button>
                  <button class="text-button delete" @click="ledger.deleteTransaction(transaction.id)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
