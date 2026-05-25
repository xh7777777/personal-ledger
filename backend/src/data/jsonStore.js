import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { paths } from "../config/paths.js";

const stateFile = join(paths.dataDir, "state.json");

function defaultState() {
  return {
    accounts: [],
    transactions: []
  };
}

function normalizeState(state) {
  return {
    ...defaultState(),
    ...state,
    accounts: Array.isArray(state?.accounts) ? state.accounts : [],
    transactions: Array.isArray(state?.transactions) ? state.transactions : []
  };
}

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
  await mkdir(paths.dataDir, { recursive: true });
  await writeFile(stateFile, `${JSON.stringify(normalizeState(state), null, 2)}\n`);
}
