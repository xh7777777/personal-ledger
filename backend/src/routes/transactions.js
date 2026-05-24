import { Hono } from "hono";
import { createTransaction, deleteTransaction, updateTransaction } from "../services/transactionService.js";
import { jsonError } from "../utils/http.js";

export const transactionsRouter = new Hono();

transactionsRouter.post("/", async (c) => {
  const result = await createTransaction(await c.req.json());
  if (result.error) return jsonError(c, result.error, result.status);
  return c.json(result.data, result.status);
});

transactionsRouter.put("/:id", async (c) => {
  const result = await updateTransaction(c.req.param("id"), await c.req.json());
  if (result.error) return jsonError(c, result.error, result.status);
  return c.json(result.data);
});

transactionsRouter.delete("/:id", async (c) => {
  const result = await deleteTransaction(c.req.param("id"));
  if (result.error) return jsonError(c, result.error, result.status);
  return c.json(result.data);
});
