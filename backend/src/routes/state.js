import { Hono } from "hono";
import { readState } from "../data/jsonStore.js";

export const stateRouter = new Hono();

stateRouter.get("/", async (c) => {
  const state = await readState();
  return c.json(state);
});
