import { roundMoney } from "../utils/money.js";

export function validateTemplateInput(input) {
  if (!String(input.name || "").trim()) return "请填写模板名称。";
  if (!["income", "expense"].includes(input.type)) return "模板类型必须是 income 或 expense。";
  if (input.amount !== "" && input.amount != null && Number.isNaN(roundMoney(input.amount))) return "请填写有效金额。";
  return null;
}
