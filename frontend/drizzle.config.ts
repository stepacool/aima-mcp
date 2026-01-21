import { defineConfig } from "drizzle-kit";

// Construct DATABASE_URL from granular vars if not provided (backwards compatible)
function getDatabaseUrl(): string {
    if (process.env.DATABASE_URL) {
       // Append SSL params if not already present
       const url = process.env.DATABASE_URL;
       if (!url.includes('sslmode=')) {
           return url + (url.includes('?') ? '&' : '?') + 'sslmode=require';
       }
       return url;
    }
    const user = process.env.POSTGRES_USER ?? "postgres";
    const password = process.env.POSTGRES_PASSWORD ?? "password";
    const host = process.env.POSTGRES_HOST ?? "localhost";
    const port = process.env.POSTGRES_PORT ?? "5432";
    const db = process.env.POSTGRES_DB ?? "database";
    return `postgresql://${user}:${password}@${host}:${port}/${db}?sslmode=require`;
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./lib/db/schema/index.ts",
	out: "./lib/db/migrations",
	dbCredentials: {
		url: getDatabaseUrl(),
	},
	tablesFilter: "*",
	migrations: {
		prefix: "timestamp",
		table: "__drizzle_migrations",
		schema: "public",
	},
});
