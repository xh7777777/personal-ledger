import { Hono } from "hono";
import { createTemplate, deleteTemplate, updateTemplate } from "../services/templateService.js";
import { jsonError } from "../utils/http.js";

export const templatesRouter = new Hono();

templatesRouter.post("/", async (c) => {
  const result = await createTemplate(await c.req.json());
  if (result.error) return jsonError(c, result.error, result.status);
  return c.json(result.data, result.status);
});

templatesRouter.put("/:id", async (c) => {
  const result = await updateTemplate(c.req.param("id"), await c.req.json());
  if (result.error) return jsonError(c, result.error, result.status);
  return c.json(result.data);
});

templatesRouter.delete("/:id", async (c) => {
  const result = await deleteTemplate(c.req.param("id"));
  if (result.error) return jsonError(c, result.error, result.status);
  return c.json(result.data);
});
