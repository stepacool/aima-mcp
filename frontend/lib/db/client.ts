import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getDatabaseUrl, shouldUseSSL } from "@/lib/env";
import * as schema from "./schema";

const pool = new Pool({
	connectionString: getDatabaseUrl(),
	// Only enable SSL for remote databases (not localhost)
	...(shouldUseSSL() && {
		ssl: {
			rejectUnauthorized: false,
		},
	}),
});

export const db = drizzle(pool, {
	schema,
});
