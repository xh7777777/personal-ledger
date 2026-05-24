import { roundMoney } from "../utils/money.js";

export function validateAccountInput(input) {
  if (!String(input.name || "").trim()) return "请填写账户名称。";
  if (Number.isNaN(roundMoney(input.initialBalance))) return "请填写有效金额。";
  return null;
}
