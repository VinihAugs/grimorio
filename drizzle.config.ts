import { defineConfig } from "drizzle-kit";

// Só valida DATABASE_URL se não estiver usando armazenamento em memória
if (!process.env.DATABASE_URL && !process.env.USE_MEMORY_STORAGE) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy",
  },
});
