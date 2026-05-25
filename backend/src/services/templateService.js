import crypto from "node:crypto";
import { updateState } from "../data/jsonStore.js";
import { roundMoney } from "../utils/money.js";
import { validateTemplateInput } from "../validators/templates.js";

const DEFAULT_CATEGORY = "未分类";

function normalizeTemplate(input, base = {}) {
  const now = new Date().toISOString();
  return {
    ...base,
    name: String(input.name || "").trim(),
    type: input.type,
    amount: input.amount === "" || input.amount == null ? "" : roundMoney(input.amount),
    accountId: input.accountId || "",
    category: String(input.category || "").trim() || DEFAULT_CATEGORY,
    target: String(input.target || "").trim(),
    note: String(input.note || "").trim(),
    updatedAt: now
  };
}

export async function createTemplate(input) {
  const error = validateTemplateInput(input);
  if (error) return { error, status: 400 };

  const now = new Date().toISOString();
  let template;
  await updateState((state) => {
    template = normalizeTemplate(input, {
      id: crypto.randomUUID(),
      createdAt: now
    });
    state.templates.push(template);
    return state;
  });
  return { data: template, status: 201 };
}

export async function updateTemplate(id, input) {
  const error = validateTemplateInput(input);
  if (error) return { error, status: 400 };

  let missing = false;
  let template;
  await updateState((state) => {
    const index = state.templates.findIndex((item) => item.id === id);
    if (index < 0) {
      missing = true;
      return state;
    }
    state.templates[index] = normalizeTemplate(input, state.templates[index]);
    template = state.templates[index];
    return state;
  });
  if (missing) return { error: "模板不存在。", status: 404 };
  return { data: template };
}

export async function deleteTemplate(id) {
  let found = false;
  await updateState((state) => {
    const before = state.templates.length;
    state.templates = state.templates.filter((item) => item.id !== id);
    found = state.templates.length < before;
    return state;
  });
  if (!found) return { error: "模板不存在。", status: 404 };
  return { data: { ok: true } };
}
