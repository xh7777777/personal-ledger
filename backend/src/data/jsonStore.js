import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { paths } from "../config/paths.js";

const stateFile = join(paths.dataDir, "state.json");

function defaultState() {
  return {
    accounts: [],
    transactions: [],
    schedules: [],
    templates: []
  };
}

function normalizeState(state) {
  return {
    ...defaultState(),
    ...state,
    accounts: Array.isArray(state?.accounts) ? state.accounts : [],
    transactions: Array.isArray(state?.transactions) ? state.transactions : [],
    schedules: Array.isArray(state?.schedules) ? state.schedules : [],
    templates: Array.isArray(state?.templates) ? state.templates : []
  };
}

let writeQueue = Promise.resolve();

export async function readState() {
  try {
    const content = await readFile(stateFile, "utf8");
    if (!content.trim()) return defaultState();
    return normalizeState(JSON.parse(content));
  } catch (error) {
    if (error.code === "ENOENT") return defaultState();
    throw error;
  }
}

export async function writeState(state) {
  writeQueue = writeQueue.then(async () => {
    await mkdir(paths.dataDir, { recursive: true });
    await writeFile(stateFile, `${JSON.stringify(normalizeState(state), null, 2)}\n`);
  });
  return writeQueue;
}

export async function updateState(mutator) {
  let nextState;
  writeQueue = writeQueue.then(async () => {
    const state = await readState();
    nextState = (await mutator(state)) || state;
    await mkdir(paths.dataDir, { recursive: true });
    await writeFile(stateFile, `${JSON.stringify(normalizeState(nextState), null, 2)}\n`);
  });
  await writeQueue;
  return normalizeState(nextState);
}
