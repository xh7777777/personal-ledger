import crypto from "node:crypto";
import { updateState } from "../data/jsonStore.js";
import { roundMoney } from "../utils/money.js";
import { applyTransaction } from "../utils/transactions.js";
import { validateTransactionInput } from "../validators/transactions.js";

const DEFAULT_CATEGORY = "未分类";

function normalizeCategory(category) {
  return String(category || "").trim() || DEFAULT_CATEGORY;
}

export async function createTransaction(input) {
  const error = validateTransactionInput(input);
  if (error) return { error, status: 400 };

  const now = new Date().toISOString();
  let transaction;
  const result = await updateState((state) => {
    if (!state.accounts.some((account) => account.id === input.accountId)) {
      return state;
    }
    transaction = {
      id: crypto.randomUUID(),
      type: input.type,
      amount: roundMoney(input.amount),
      date: input.date,
      accountId: input.accountId,
      category: normalizeCategory(input.category),
      target: String(input.target || "").trim(),
      note: String(input.note || "").trim(),
      createdAt: now,
      updatedAt: now
    };
    state.transactions.push(transaction);
    applyTransaction(state.accounts, transaction, 1);
    return state;
  });
  if (!transaction && !result.accounts.some((account) => account.id === input.accountId)) {
    return { error: "账户不存在。", status: 404 };
  }
  return { data: transaction, status: 201 };
}

export async function updateTransaction(id, input) {
  const error = validateTransactionInput(input);
  if (error) return { error, status: 400 };

  let missingTransaction = false;
  let missingAccount = false;
  let updated;
  await updateState((state) => {
    const index = state.transactions.findIndex((item) => item.id === id);
    if (index < 0) {
      missingTransaction = true;
      return state;
    }
    if (!state.accounts.some((account) => account.id === input.accountId)) {
      missingAccount = true;
      return state;
    }

    applyTransaction(state.accounts, state.transactions[index], -1);
    updated = {
      ...state.transactions[index],
      type: input.type,
      amount: roundMoney(input.amount),
      date: input.date,
      accountId: input.accountId,
      category: normalizeCategory(input.category),
      target: String(input.target || "").trim(),
      note: String(input.note || "").trim(),
      updatedAt: new Date().toISOString()
    };

    state.transactions[index] = updated;
    applyTransaction(state.accounts, updated, 1);
    return state;
  });
  if (missingTransaction) return { error: "流水不存在。", status: 404 };
  if (missingAccount) return { error: "账户不存在。", status: 404 };
  return { data: updated };
}

export async function deleteTransaction(id) {
  let found = false;
  await updateState((state) => {
    const transaction = state.transactions.find((item) => item.id === id);
    if (!transaction) return state;
    found = true;
    applyTransaction(state.accounts, transaction, -1);
    state.transactions = state.transactions.filter((item) => item.id !== transaction.id);
    return state;
  });
  if (!found) return { error: "流水不存在。", status: 404 };
  return { data: { ok: true } };
}
