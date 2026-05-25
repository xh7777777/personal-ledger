import crypto from "node:crypto";
import { readState, writeState } from "../data/jsonStore.js";
import { roundMoney } from "../utils/money.js";
import { applyTransaction } from "../utils/transactions.js";
import { validateScheduleInput } from "../validators/schedules.js";

const DEFAULT_CATEGORY = "未分类";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeCategory(category) {
  return String(category || "").trim() || DEFAULT_CATEGORY;
}

function normalizeDate(value) {
  return String(value || "").slice(0, 10);
}

function addInterval(dateIso, frequency) {
  const date = new Date(`${dateIso}T00:00:00`);
  if (frequency === "daily") date.setDate(date.getDate() + 1);
  if (frequency === "weekly") date.setDate(date.getDate() + 7);
  if (frequency === "monthly") date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 10);
}

function scheduleToTransaction(schedule, runDate) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    scheduleId: schedule.id,
    type: schedule.type,
    amount: roundMoney(schedule.amount),
    date: runDate,
    accountId: schedule.accountId,
    category: normalizeCategory(schedule.category),
    target: String(schedule.target || "").trim(),
    note: String(schedule.note || "").trim(),
    createdAt: now,
    updatedAt: now
  };
}

export async function materializeDueSchedules(state = null) {
  const ledger = state || (await readState());
  const today = todayIso();
  let changed = false;

  for (const schedule of ledger.schedules) {
    if (!schedule.active) continue;
    if (!ledger.accounts.some((account) => account.id === schedule.accountId)) continue;

    let nextRunDate = normalizeDate(schedule.nextRunDate || schedule.startDate);
    let guard = 0;

    while (nextRunDate && nextRunDate <= today && guard < 366) {
      const transaction = scheduleToTransaction(schedule, nextRunDate);
      ledger.transactions.push(transaction);
      applyTransaction(ledger.accounts, transaction, 1);
      schedule.lastRunDate = nextRunDate;
      nextRunDate = addInterval(nextRunDate, schedule.frequency);
      schedule.nextRunDate = nextRunDate;
      schedule.updatedAt = new Date().toISOString();
      changed = true;
      guard += 1;
    }
  }

  if (changed && !state) await writeState(ledger);
  return { state: ledger, changed };
}

export async function readStateWithSchedules() {
  const result = await materializeDueSchedules();
  return result.state;
}

export async function createSchedule(input) {
  const error = validateScheduleInput(input);
  if (error) return { error, status: 400 };

  const state = await readStateWithSchedules();
  if (!state.accounts.some((account) => account.id === input.accountId)) {
    return { error: "账户不存在。", status: 404 };
  }

  const now = new Date().toISOString();
  const schedule = {
    id: crypto.randomUUID(),
    type: input.type,
    amount: roundMoney(input.amount),
    accountId: input.accountId,
    category: normalizeCategory(input.category),
    target: String(input.target || "").trim(),
    note: String(input.note || "").trim(),
    frequency: input.frequency,
    startDate: normalizeDate(input.startDate),
    nextRunDate: normalizeDate(input.startDate),
    lastRunDate: "",
    active: input.active !== false,
    createdAt: now,
    updatedAt: now
  };

  state.schedules.push(schedule);
  await writeState(state);
  return { data: schedule, status: 201 };
}

export async function updateSchedule(id, input) {
  const error = validateScheduleInput(input);
  if (error) return { error, status: 400 };

  const state = await readStateWithSchedules();
  const schedule = state.schedules.find((item) => item.id === id);
  if (!schedule) return { error: "定时记账不存在。", status: 404 };
  if (!state.accounts.some((account) => account.id === input.accountId)) {
    return { error: "账户不存在。", status: 404 };
  }

  const startDate = normalizeDate(input.startDate);
  schedule.type = input.type;
  schedule.amount = roundMoney(input.amount);
  schedule.accountId = input.accountId;
  schedule.category = normalizeCategory(input.category);
  schedule.target = String(input.target || "").trim();
  schedule.note = String(input.note || "").trim();
  schedule.frequency = input.frequency;
  schedule.startDate = startDate;
  schedule.nextRunDate = input.nextRunDate ? normalizeDate(input.nextRunDate) : startDate;
  schedule.active = input.active !== false;
  schedule.updatedAt = new Date().toISOString();

  await writeState(state);
  return { data: schedule };
}

export async function toggleSchedule(id, active) {
  const state = await readStateWithSchedules();
  const schedule = state.schedules.find((item) => item.id === id);
  if (!schedule) return { error: "定时记账不存在。", status: 404 };

  schedule.active = Boolean(active);
  schedule.updatedAt = new Date().toISOString();
  await writeState(state);
  return { data: schedule };
}

export async function deleteSchedule(id) {
  const state = await readStateWithSchedules();
  const before = state.schedules.length;
  state.schedules = state.schedules.filter((item) => item.id !== id);
  if (state.schedules.length === before) return { error: "定时记账不存在。", status: 404 };

  await writeState(state);
  return { data: { ok: true } };
}
