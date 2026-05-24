import { Hono } from "hono";
import { createAccount, deleteAccount, updateAccount } from "../services/accountService.js";
import { jsonError } from "../utils/http.js";

export const accountsRouter = new Hono();

accountsRouter.post("/", async (c) => {
  const result = await createAccount(await c.req.json());
  if (result.error) return jsonError(c, result.error, result.status);
  return c.json(result.data, result.status);
});

accountsRouter.put("/:id", async (c) => {
  const result = await updateAccount(c.req.param("id"), await c.req.json());
  if (result.error) return jsonError(c, result.error, result.status);
  return c.json(result.data);
});

accountsRouter.delete("/:id", async (c) => {
  const result = await deleteAccount(c.req.param("id"));
  if (result.error) return jsonError(c, result.error, result.status);
  return c.json(result.data);
});
