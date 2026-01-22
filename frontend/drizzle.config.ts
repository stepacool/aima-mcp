import { defineConfig } from "drizzle-kit";

// Construct DATABASE_URL from granular vars if not provided (backwards compatible)
function getDatabaseUrl(): string {
    if (process.env.DATABASE_URL) {
        // Don't modify if sslmode is already present
        const url = process.env.DATABASE_URL;
        if (url.includes('sslmode=')) {
            return url;
        }
        // Only require SSL for non-localhost connections
        const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
        const sslMode = isLocalhost ? 'disable' : 'require';
        return url + (url.includes('?') ? '&' : '?') + `sslmode=${sslMode}`;
    }
    const user = process.env.POSTGRES_USER ?? "postgres";
    const password = process.env.POSTGRES_PASSWORD ?? "password";
    const host = process.env.POSTGRES_HOST ?? "localhost";
    const port = process.env.POSTGRES_PORT ?? "5432";
    const db = process.env.POSTGRES_DB ?? "database";
    // Only require SSL for non-localhost connections
    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    const sslMode = isLocalhost ? "disable" : "require";
    return `postgresql://${user}:${password}@${host}:${port}/${db}?sslmode=${sslMode}`;
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
