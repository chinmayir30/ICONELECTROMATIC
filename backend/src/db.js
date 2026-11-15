import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPrismaClient } from "./prismaClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure environment variables are loaded regardless of current working directory
if (!process.env.DATABASE_URL && !process.env.TEST_DATABASE_URL) {
  dotenv.config();
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

function resolveDatabaseUrl() {
  if (process.env.NODE_ENV === "test") {
    return process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  }
  return process.env.DATABASE_URL;
}

const targetUrl = resolveDatabaseUrl();
const prisma = createPrismaClient(targetUrl);

export default prisma;
