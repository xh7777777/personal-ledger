import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { serverConfig } from "./config/server.js";

const app = createApp();

serve({ fetch: app.fetch, port: serverConfig.port, hostname: serverConfig.host }, () => {
  const host = serverConfig.host === "0.0.0.0" ? "localhost" : serverConfig.host;
  console.log(`Ledger API running at http://${host}:${serverConfig.port}`);
});
