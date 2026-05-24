import { Hono } from "hono";
import { accountsRouter } from "./accounts.js";
import { healthRouter } from "./health.js";
import { stateRouter } from "./state.js";
import { transactionsRouter } from "./transactions.js";

export const apiRouter = new Hono();

apiRouter.route("/health", healthRouter);
apiRouter.route("/state", stateRouter);
apiRouter.route("/accounts", accountsRouter);
apiRouter.route("/transactions", transactionsRouter);
