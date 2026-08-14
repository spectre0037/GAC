import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import * as schema from "./schema/index.js";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env");
}

const sql = neon(process.env.DATABASE_URL);

try {
  const result = await sql`SELECT NOW()`;
  console.log("✅ Neon database connected:", result[0]);
} catch (error) {
  console.error("❌ Neon database connection failed:");
  console.error(error);
}

export const db = drizzle(sql, { schema });