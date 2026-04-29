// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/src/db/schema/index.ts",
  out: "./app/src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:sdx2026@localhost:5432/sdxcatalog",
  },
});
