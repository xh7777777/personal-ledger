<script setup>
import AccountsView from "./components/AccountsView.vue";
import AppHeader from "./components/AppHeader.vue";
import DashboardView from "./components/DashboardView.vue";
import SchedulesView from "./components/SchedulesView.vue";
import TransactionsView from "./components/TransactionsView.vue";
import AccountModal from "./components/modals/AccountModal.vue";
import ScheduleModal from "./components/modals/ScheduleModal.vue";
import TransactionModal from "./components/modals/TransactionModal.vue";
import { useLedger } from "./composables/useLedger";

const ledger = useLedger();
</script>

<template>
  <div class="app-shell">
    <AppHeader :active-view="ledger.state.activeView" @add-transaction="ledger.openTransactionModal()" @change-view="ledger.setView" />

    <main>
      <div v-if="ledger.state.error" class="panel error-panel">{{ ledger.state.error }}</div>
      <div v-if="ledger.state.loading" class="panel empty-state">正在加载账本数据</div>

      <DashboardView v-show="ledger.state.activeView === 'dashboard'" :ledger="ledger" />
      <TransactionsView v-show="ledger.state.activeView === 'transactions'" :ledger="ledger" />
      <SchedulesView v-show="ledger.state.activeView === 'schedules'" :ledger="ledger" />
      <AccountsView v-show="ledger.state.activeView === 'accounts'" :ledger="ledger" />
    </main>

    <TransactionModal
      :accounts="ledger.state.accounts"
      :error="ledger.errors.transaction"
      :form="ledger.transactionForm"
      :open="ledger.ui.transactionModalOpen"
      @close="ledger.ui.transactionModalOpen = false"
      @submit="ledger.saveTransaction"
    />

    <AccountModal
      :error="ledger.errors.account"
      :form="ledger.accountForm"
      :open="ledger.ui.accountModalOpen"
      @close="ledger.ui.accountModalOpen = false"
      @submit="ledger.saveAccount"
    />

    <ScheduleModal
      :accounts="ledger.state.accounts"
      :error="ledger.errors.schedule"
      :form="ledger.scheduleForm"
      :open="ledger.ui.scheduleModalOpen"
      @close="ledger.ui.scheduleModalOpen = false"
      @submit="ledger.saveSchedule"
    />
  </div>
</template>
