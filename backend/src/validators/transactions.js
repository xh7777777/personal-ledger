import { roundMoney } from "../utils/money.js";

export function validateTransactionInput(input) {
  const amount = roundMoney(input.amount);
  if (!["income", "expense"].includes(input.type)) return "流水类型必须是 income 或 expense。";
  if (!amount || amount <= 0) return "金额必须大于 0。";
  if (!input.accountId) return "请选择账户。";
  if (!input.date) return "请选择日期。";
  return null;
}
