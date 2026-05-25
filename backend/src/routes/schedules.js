import { Hono } from "hono";
import { createSchedule, deleteSchedule, toggleSchedule, updateSchedule } from "../services/scheduleService.js";
import { jsonError } from "../utils/http.js";

export const schedulesRouter = new Hono();

schedulesRouter.post("/", async (c) => {
  const result = await createSchedule(await c.req.json());
  if (result.error) return jsonError(c, result.error, result.status);
  return c.json(result.data, result.status);
});

schedulesRouter.put("/:id", async (c) => {
  const result = await updateSchedule(c.req.param("id"), await c.req.json());
  if (result.error) return jsonError(c, result.error, result.status);
  return c.json(result.data);
});

schedulesRouter.patch("/:id/active", async (c) => {
  const result = await toggleSchedule(c.req.param("id"), (await c.req.json()).active);
  if (result.error) return jsonError(c, result.error, result.status);
  return c.json(result.data);
});

schedulesRouter.delete("/:id", async (c) => {
  const result = await deleteSchedule(c.req.param("id"));
  if (result.error) return jsonError(c, result.error, result.status);
  return c.json(result.data);
});
