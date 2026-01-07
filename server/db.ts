import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Permite rodar sem banco de dados se USE_MEMORY_STORAGE estiver definido
if (!process.env.DATABASE_URL && !process.env.USE_MEMORY_STORAGE) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?\n" +
    "Ou defina USE_MEMORY_STORAGE=true para usar armazenamento em memória (sem banco de dados)."
  );
}

// Só inicializa o banco se DATABASE_URL estiver definido
export const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;
export const db = pool ? drizzle(pool, { schema }) : null;
