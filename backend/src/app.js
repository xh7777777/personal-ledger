import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { join } from "node:path";
import { paths } from "./config/paths.js";
import { apiRouter } from "./routes/api.js";

export function createApp() {
  const app = new Hono();

  app.use("/api/*", cors());
  app.route("/api", apiRouter);
  app.use("/*", serveStatic({ root: paths.publicDir }));
  app.get("*", serveStatic({ path: join(paths.publicDir, "index.html") }));

  return app;
}
