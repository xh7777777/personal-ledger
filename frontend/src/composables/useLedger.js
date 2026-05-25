import { computed, onMounted, reactive } from "vue";
import { ledgerApi } from "../api/ledger";
import { accountDisplay, categoryDisplay, defaultCategory, rangeLabels, scheduleFrequencyLabels } from "../constants/ledger";
import { makeTrendBuckets, todayIso, transactionMatchesRange } from "../utils/date";
import { money } from "../utils/format";
import { sortTransactions } from "../utils/transactions";

export function useLedger() {
  const state = reactive({
    accounts: [],
    transactions: [],
    schedules: [],
    templates: [],
    loading: true,
    error: "",
    activeView: "dashboard",
    activeRange: "day",
    customStart: todayIso(),
    customEnd: todayIso(),
    filters: {
      type: "all",
      accountId: "all",
      category: "all",
      dateStart: "",
      dateEnd: "",
      amountMin: "",
      amountMax: "",
      keyword: ""
    }
  });

  const ui = reactive({
    transactionModalOpen: false,
    accountModalOpen: false,
    scheduleModalOpen: false
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

  const scheduleForm = reactive({
    id: "",
    type: "expense",
    amount: "",
    accountId: "",
    category: "",
    target: "",
    note: "",
    frequency: "monthly",
    startDate: todayIso(),
    nextRunDate: "",
    active: true
  });

  const quickForm = reactive({
    type: "expense",
    amount: "",
    date: todayIso(),
    accountId: "",
    category: "",
    target: "",
    note: ""
  });

  const errors = reactive({
    transaction: "",
    account: "",
    schedule: ""
  });

  const totalBalance = computed(() => state.accounts.reduce((sum, account) => sum + Number(account.currentBalance || 0), 0));
  const scopedTransactions = computed(() => state.transactions.filter((transaction) => transactionMatchesRange(transaction, state.activeRange, state.customStart, state.customEnd)));
  const periodIncome = computed(() => scopedTransactions.value.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0));
  const periodExpense = computed(() => scopedTransactions.value.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0));
  const periodNet = computed(() => periodIncome.value - periodExpense.value);
  const incomeCount = computed(() => scopedTransactions.value.filter((item) => item.type === "income").length);
  const expenseCount = computed(() => scopedTransactions.value.filter((item) => item.type === "expense").length);
  const withCategoryMeta = (transaction) => ({ ...transaction, categoryMeta: categoryDisplay(transaction.category) });
  const recentTransactions = computed(() => [...state.transactions].sort(sortTransactions).slice(0, 8).map(withCategoryMeta));

  const filteredTransactions = computed(() => {
    const keyword = state.filters.keyword.trim().toLowerCase();
    return [...state.transactions]
      .filter((transaction) => state.filters.type === "all" || transaction.type === state.filters.type)
      .filter((transaction) => state.filters.accountId === "all" || transaction.accountId === state.filters.accountId)
      .filter((transaction) => state.filters.category === "all" || categoryDisplay(transaction.category).name === state.filters.category)
      .filter((transaction) => !state.filters.dateStart || transaction.date >= state.filters.dateStart)
      .filter((transaction) => !state.filters.dateEnd || transaction.date <= state.filters.dateEnd)
      .filter((transaction) => state.filters.amountMin === "" || Number(transaction.amount) >= Number(state.filters.amountMin))
      .filter((transaction) => state.filters.amountMax === "" || Number(transaction.amount) <= Number(state.filters.amountMax))
      .filter((transaction) => {
        if (!keyword) return true;
        const category = categoryDisplay(transaction.category).name;
        return [category, transaction.target, transaction.note].filter(Boolean).some((value) => value.toLowerCase().includes(keyword));
      })
      .sort(sortTransactions)
      .map(withCategoryMeta);
  });

  const scheduleRows = computed(() =>
    [...state.schedules]
      .sort((a, b) => String(a.nextRunDate || a.startDate).localeCompare(String(b.nextRunDate || b.startDate)))
      .map((schedule) => ({
        ...schedule,
        categoryMeta: categoryDisplay(schedule.category),
        frequencyLabel: scheduleFrequencyLabels[schedule.frequency] || schedule.frequency,
        accountName: accountName(schedule.accountId)
      }))
  );

  const templateRows = computed(() =>
    [...state.templates].map((template) => ({
      ...template,
      categoryMeta: categoryDisplay(template.category),
      accountName: template.accountId ? accountName(template.accountId) : "未指定账户"
    }))
  );

  const transactionCategoryOptions = computed(() => {
    const names = new Set(state.transactions.map((transaction) => categoryDisplay(transaction.category).name));
    state.templates.forEach((template) => names.add(categoryDisplay(template.category).name));
    return [...names].sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  });

  const categoryRows = computed(() => {
    const totals = scopedTransactions.value
      .filter((item) => item.type === "expense")
      .reduce((map, item) => {
        const category = item.category || defaultCategory.name;
        map[category] = (map[category] || 0) + item.amount;
        return map;
      }, {});
    const rows = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const max = Math.max(...rows.map(([, amount]) => amount), 1);
    return rows.map(([name, amount]) => ({ ...categoryDisplay(name), amount, width: `${Math.max((amount / max) * 100, 3)}%` }));
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

  function accountMeta(type) {
    return accountDisplay(type);
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
      state.schedules = data.schedules || [];
      state.templates = data.templates || [];
      if (!quickForm.accountId) resetQuickForm();
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

  function recentAccountId() {
    return [...state.transactions].sort(sortTransactions)[0]?.accountId || state.accounts[0]?.id || "";
  }

  function resetQuickForm() {
    quickForm.type = "expense";
    quickForm.amount = "";
    quickForm.date = todayIso();
    quickForm.accountId = recentAccountId();
    quickForm.category = "";
    quickForm.target = "";
    quickForm.note = "";
  }

  function applyTemplateToForm(template, form = transactionForm) {
    form.type = template.type;
    form.amount = template.amount || "";
    form.accountId = template.accountId || recentAccountId();
    form.category = template.category || "";
    form.target = template.target || "";
    form.note = template.note || "";
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
        category: transactionForm.category.trim() || defaultCategory.name,
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

  async function saveQuickTransaction() {
    errors.transaction = "";
    try {
      const payload = {
        type: quickForm.type,
        amount: Number(quickForm.amount),
        date: quickForm.date || todayIso(),
        accountId: quickForm.accountId || recentAccountId(),
        category: quickForm.category.trim() || defaultCategory.name,
        target: quickForm.target,
        note: quickForm.note
      };
      await ledgerApi.createTransaction(payload);
      resetQuickForm();
      await loadState();
    } catch (error) {
      errors.transaction = error.message;
    }
  }

  function copyTransaction(transaction) {
    resetTransactionForm({ ...transaction, id: "", date: todayIso() });
    ui.transactionModalOpen = true;
  }

  async function createTemplateFromTransaction(transaction) {
    const name = transaction.target || categoryDisplay(transaction.category).name;
    await ledgerApi.createTemplate({
      name,
      type: transaction.type,
      amount: transaction.amount,
      accountId: transaction.accountId,
      category: transaction.category,
      target: transaction.target,
      note: transaction.note
    });
    await loadState();
  }

  async function deleteTemplate(id) {
    if (!confirm("确定删除这个记账模板吗？历史流水不会受影响。")) return;
    await ledgerApi.deleteTemplate(id);
    await loadState();
  }

  async function exportLedger() {
    const data = await ledgerApi.exportState();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `personal-ledger-${todayIso()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function deleteTransaction(id) {
    if (!confirm("确定删除这笔流水吗？账户金额会同步还原。")) return;
    await ledgerApi.deleteTransaction(id);
    await loadState();
  }

  function resetScheduleForm(schedule = null) {
    errors.schedule = "";
    scheduleForm.id = schedule?.id || "";
    scheduleForm.type = schedule?.type || "expense";
    scheduleForm.amount = schedule?.amount || "";
    scheduleForm.accountId = schedule?.accountId || state.accounts[0]?.id || "";
    scheduleForm.category = schedule?.category || "";
    scheduleForm.target = schedule?.target || "";
    scheduleForm.note = schedule?.note || "";
    scheduleForm.frequency = schedule?.frequency || "monthly";
    scheduleForm.startDate = schedule?.startDate || todayIso();
    scheduleForm.nextRunDate = schedule?.nextRunDate || "";
    scheduleForm.active = schedule?.active ?? true;
  }

  function openScheduleModal(schedule = null) {
    if (!state.accounts.length) {
      openAccountModal();
      errors.account = "请先新增一个账户。";
      return;
    }
    resetScheduleForm(schedule);
    ui.scheduleModalOpen = true;
  }

  async function saveSchedule() {
    errors.schedule = "";
    try {
      const payload = {
        type: scheduleForm.type,
        amount: Number(scheduleForm.amount),
        accountId: scheduleForm.accountId,
        category: scheduleForm.category.trim() || defaultCategory.name,
        target: scheduleForm.target,
        note: scheduleForm.note,
        frequency: scheduleForm.frequency,
        startDate: scheduleForm.startDate,
        active: scheduleForm.active
      };
      if (scheduleForm.id && scheduleForm.nextRunDate) payload.nextRunDate = scheduleForm.nextRunDate;
      if (scheduleForm.id) await ledgerApi.updateSchedule(scheduleForm.id, payload);
      else await ledgerApi.createSchedule(payload);
      ui.scheduleModalOpen = false;
      await loadState();
    } catch (error) {
      errors.schedule = error.message;
    }
  }

  async function toggleSchedule(id, active) {
    await ledgerApi.toggleSchedule(id, active);
    await loadState();
  }

  async function deleteSchedule(id) {
    if (!confirm("确定删除这条定时记账吗？已生成的流水不会删除。")) return;
    await ledgerApi.deleteSchedule(id);
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
    scheduleForm,
    quickForm,
    errors,
    totalBalance,
    periodIncome,
    periodExpense,
    periodNet,
    incomeCount,
    expenseCount,
    recentTransactions,
    filteredTransactions,
    scheduleRows,
    templateRows,
    transactionCategoryOptions,
    categoryRows,
    trendRows,
    money,
    accountName,
    accountMeta,
    rangeLabel,
    setView,
    openTransactionModal,
    saveTransaction,
    saveQuickTransaction,
    copyTransaction,
    createTemplateFromTransaction,
    deleteTemplate,
    applyTemplateToForm,
    resetQuickForm,
    exportLedger,
    deleteTransaction,
    openScheduleModal,
    saveSchedule,
    toggleSchedule,
    deleteSchedule,
    openAccountModal,
    saveAccount,
    deleteAccount
  });
}
