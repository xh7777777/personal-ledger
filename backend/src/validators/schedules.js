import { roundMoney } from "../utils/money.js";

export function validateScheduleInput(input) {
  const amount = roundMoney(input.amount);
  if (!["income", "expense"].includes(input.type)) return "定时记账类型必须是 income 或 expense。";
  if (!amount || amount <= 0) return "金额必须大于 0。";
  if (!input.accountId) return "请选择账户。";
  if (!["daily", "weekly", "monthly"].includes(input.frequency)) return "请选择有效频率。";
  if (!input.startDate) return "请选择开始日期。";
  return null;
}
