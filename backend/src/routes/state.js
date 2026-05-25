import { Hono } from "hono";
import { readStateWithSchedules } from "../services/scheduleService.js";

export const stateRouter = new Hono();

stateRouter.get("/", async (c) => {
  const state = await readStateWithSchedules();
  return c.json(state);
});
