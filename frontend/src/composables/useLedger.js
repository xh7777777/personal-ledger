import { computed, onMounted, reactive } from "vue";
import { ledgerApi } from "../api/ledger";
import { rangeLabels } from "../constants/ledger";
import { makeTrendBuckets, todayIso, transactionMatchesRange } from "../utils/date";
import { money } from "../utils/format";
import { sortTransactions } from "../utils/transactions";

export function useLedger() {
  const state = reactive({
    accounts: [],
    transactions: [],
    loading: true,
    error: "",
    activeView: "dashboard",
    activeRange: "day",
    customStart: todayIso(),
    customEnd: todayIso(),
    filters: {
      type: "all",
      accountId: "all",
      keyword: ""
    }
  });

  const ui = reactive({
    transactionModalOpen: false,
    accountModalOpen: false
  });

  const transactionForm = reactive({
    id: "",
    type: "expense",
    amount: "",
    date: todayIso(),
    accountId: "",
    category: "",
    target: "",
    note: ""
  });

  const accountForm = reactive({
    id: "",
    name: "",
    type: "现金",
    initialBalance: "",
    note: ""
  });

  const errors = reactive({
    transaction: "",
    account: ""
  });

  const totalBalance = computed(() => state.accounts.reduce((sum, account) => sum + Number(account.currentBalance || 0), 0));
  const scopedTransactions = computed(() => state.transactions.filter((transaction) => transactionMatchesRange(transaction, state.activeRange, state.customStart, state.customEnd)));
  const periodIncome = computed(() => scopedTransactions.value.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0));
  const periodExpense = computed(() => scopedTransactions.value.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0));
  const periodNet = computed(() => periodIncome.value - periodExpense.value);
  const incomeCount = computed(() => scopedTransactions.value.filter((item) => item.type === "income").length);
  const expenseCount = computed(() => scopedTransactions.value.filter((item) => item.type === "expense").length);
  const recentTransactions = computed(() => [...state.transactions].sort(sortTransactions).slice(0, 8));

  const filteredTransactions = computed(() => {
    const keyword = state.filters.keyword.trim().toLowerCase();
    return [...state.transactions]
      .filter((transaction) => state.filters.type === "all" || transaction.type === state.filters.type)
      .filter((transaction) => state.filters.accountId === "all" || transaction.accountId === state.filters.accountId)
      .filter((transaction) => {
        if (!keyword) return true;
        return [transaction.category, transaction.target, transaction.note].filter(Boolean).some((value) => value.toLowerCase().includes(keyword));
      })
      .sort(sortTransactions);
  });

  const categoryRows = computed(() => {
    const totals = scopedTransactions.value
      .filter((item) => item.type === "expense")
      .reduce((map, item) => {
        map[item.category] = (map[item.category] || 0) + item.amount;
        return map;
      }, {});
    const rows = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const max = Math.max(...rows.map(([, amount]) => amount), 1);
    return rows.map(([name, amount]) => ({ name, amount, width: `${Math.max((amount / max) * 100, 3)}%` }));
  });

  const trendRows = computed(() => {
    const buckets = makeTrendBuckets(state.activeRange);
    scopedTransactions.value.forEach((transaction) => {
      const key = state.activeRange === "year" ? transaction.date.slice(0, 7) : transaction.date;
      if (!buckets[key]) return;
      buckets[key][transaction.type] += transaction.amount;
    });
    const rows = Object.values(buckets);
    const max = Math.max(...rows.flatMap((item) => [item.income, item.expense]), 1);
    return rows.map((item) => ({
      ...item,
      incomeHeight: `${Math.max((item.income / max) * 140, item.income ? 5 : 0)}px`,
      expenseHeight: `${Math.max((item.expense / max) * 140, item.expense ? 5 : 0)}px`
    }));
  });

  function accountName(id) {
    return state.accounts.find((account) => account.id === id)?.name || "已删除账户";
  }

  function rangeLabel() {
    return rangeLabels[state.activeRange];
  }

  function setView(view) {
    state.activeView = view;
  }

  async function loadState() {
    state.loading = true;
    state.error = "";
    try {
      const data = await ledgerApi.getState();
      state.accounts = data.accounts;
      state.transactions = data.transactions;
    } catch (error) {
      state.error = error.message;
    } finally {
      state.loading = false;
    }
  }

  function resetTransactionForm(transaction = null) {
    errors.transaction = "";
    transactionForm.id = transaction?.id || "";
    transactionForm.type = transaction?.type || "expense";
    transactionForm.amount = transaction?.amount || "";
    transactionForm.date = transaction?.date || todayIso();
    transactionForm.accountId = transaction?.accountId || state.accounts[0]?.id || "";
    transactionForm.category = transaction?.category || "";
    transactionForm.target = transaction?.target || "";
    transactionForm.note = transaction?.note || "";
  }

  function openTransactionModal(transaction = null) {
    if (!state.accounts.length) {
      openAccountModal();
      errors.account = "请先新增一个账户。";
      return;
    }
    resetTransactionForm(transaction);
    ui.transactionModalOpen = true;
  }

  async function saveTransaction() {
    errors.transaction = "";
    try {
      const payload = {
        type: transactionForm.type,
        amount: Number(transactionForm.amount),
        date: transactionForm.date,
        accountId: transactionForm.accountId,
        category: transactionForm.category,
        target: transactionForm.target,
        note: transactionForm.note
      };
      if (transactionForm.id) await ledgerApi.updateTransaction(transactionForm.id, payload);
      else await ledgerApi.createTransaction(payload);
      ui.transactionModalOpen = false;
      await loadState();
    } catch (error) {
      errors.transaction = error.message;
    }
  }

  async function deleteTransaction(id) {
    if (!confirm("确定删除这笔流水吗？账户金额会同步还原。")) return;
    await ledgerApi.deleteTransaction(id);
    await loadState();
  }

  function resetAccountForm(account = null) {
    errors.account = "";
    accountForm.id = account?.id || "";
    accountForm.name = account?.name || "";
    accountForm.type = account?.type || "现金";
    accountForm.initialBalance = account?.initialBalance ?? "";
    accountForm.note = account?.note || "";
  }

  function openAccountModal(account = null) {
    resetAccountForm(account);
    ui.accountModalOpen = true;
  }

  async function saveAccount() {
    errors.account = "";
    try {
      const payload = {
        name: accountForm.name,
        type: accountForm.type,
        initialBalance: Number(accountForm.initialBalance),
        note: accountForm.note
      };
      if (accountForm.id) await ledgerApi.updateAccount(accountForm.id, payload);
      else await ledgerApi.createAccount(payload);
      ui.accountModalOpen = false;
      await loadState();
    } catch (error) {
      errors.account = error.message;
    }
  }

  async function deleteAccount(id) {
    if (!confirm("确定删除这个账户吗？")) return;
    try {
      await ledgerApi.deleteAccount(id);
      await loadState();
    } catch (error) {
      alert(error.message);
    }
  }

  onMounted(loadState);

  return reactive({
    state,
    ui,
    transactionForm,
    accountForm,
    errors,
    totalBalance,
    periodIncome,
    periodExpense,
    periodNet,
    incomeCount,
    expenseCount,
    recentTransactions,
    filteredTransactions,
    categoryRows,
    trendRows,
    money,
    accountName,
    rangeLabel,
    setView,
    openTransactionModal,
    saveTransaction,
    deleteTransaction,
    openAccountModal,
    saveAccount,
    deleteAccount
  });
}
