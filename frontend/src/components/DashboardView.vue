<script setup>
import CategoryExpenseList from "./dashboard/CategoryExpenseList.vue";
import QuickLedgerPanel from "./dashboard/QuickLedgerPanel.vue";
import RangeToolbar from "./dashboard/RangeToolbar.vue";
import RecentTransactions from "./dashboard/RecentTransactions.vue";
import SummaryCards from "./dashboard/SummaryCards.vue";
import TrendChart from "./dashboard/TrendChart.vue";

defineProps({
  ledger: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <section class="view">
    <RangeToolbar :state="ledger.state" />
    <QuickLedgerPanel :ledger="ledger" />
    <SummaryCards
      :account-count="ledger.state.accounts.length"
      :expense-count="ledger.expenseCount"
      :income-count="ledger.incomeCount"
      :money="ledger.money"
      :period-expense="ledger.periodExpense"
      :period-income="ledger.periodIncome"
      :period-net="ledger.periodNet"
      :range-label="ledger.rangeLabel()"
      :total-balance="ledger.totalBalance"
    />
    <section class="content-grid">
      <TrendChart :money="ledger.money" :rows="ledger.trendRows" />
      <CategoryExpenseList :money="ledger.money" :rows="ledger.categoryRows" />
    </section>
    <RecentTransactions :account-name="ledger.accountName" :money="ledger.money" :transactions="ledger.recentTransactions" @view-all="ledger.setView('transactions')" />
  </section>
</template>
