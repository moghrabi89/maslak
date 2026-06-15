import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import env from "@/lib/env";
import * as schema from "./schema";

const sql = neon(env.DATABASE_URL);

// We pass the schema to Drizzle so that relations are fully typed
export const db = drizzle({ client: sql, schema });
