import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = join(__dirname, "../../..");

export const paths = {
  appRoot,
  dataDir: process.env.DATA_DIR || join(appRoot, "data"),
  publicDir: join(appRoot, "frontend/dist")
};
