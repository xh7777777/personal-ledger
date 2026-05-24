import crypto from "node:crypto";
import { readState, writeState } from "../data/jsonStore.js";
import { roundMoney } from "../utils/money.js";
import { validateAccountInput } from "../validators/accounts.js";

export async function createAccount(input) {
  const error = validateAccountInput(input);
  if (error) return { error, status: 400 };

  const state = await readState();
  const initialBalance = roundMoney(input.initialBalance);
  const now = new Date().toISOString();
  const account = {
    id: crypto.randomUUID(),
    name: String(input.name).trim(),
    type: input.type || "现金",
    initialBalance,
    currentBalance: initialBalance,
    note: String(input.note || "").trim(),
    createdAt: now,
    updatedAt: now
  };

  state.accounts.push(account);
  await writeState(state);
  return { data: account, status: 201 };
}

export async function updateAccount(id, input) {
  const error = validateAccountInput(input);
  if (error) return { error, status: 400 };

  const state = await readState();
  const account = state.accounts.find((item) => item.id === id);
  if (!account) return { error: "账户不存在。", status: 404 };

  const initialBalance = roundMoney(input.initialBalance);
  const delta = roundMoney(initialBalance - Number(account.initialBalance || 0));
  account.name = String(input.name).trim();
  account.type = input.type || "现金";
  account.initialBalance = initialBalance;
  account.currentBalance = roundMoney(Number(account.currentBalance || 0) + delta);
  account.note = String(input.note || "").trim();
  account.updatedAt = new Date().toISOString();

  await writeState(state);
  return { data: account };
}

export async function deleteAccount(id) {
  const state = await readState();
  if (state.transactions.some((item) => item.accountId === id)) {
    return { error: "该账户已有流水，不能删除。", status: 409 };
  }

  state.accounts = state.accounts.filter((item) => item.id !== id);
  await writeState(state);
  return { data: { ok: true } };
}
