import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { log } from "./vite";

// Initialize the SQL client
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

// Initialize drizzle with the client
export const db = drizzle(client);

log("Database connection initialized", "db");