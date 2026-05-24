import { roundMoney } from "./money.js";

export function applyTransaction(accounts, transaction, direction = 1) {
  const account = accounts.find((item) => item.id === transaction.accountId);
  if (!account) return;

  const signed = transaction.type === "income" ? transaction.amount : -transaction.amount;
  account.currentBalance = roundMoney(Number(account.currentBalance || 0) + signed * direction);
  account.updatedAt = new Date().toISOString();
}
