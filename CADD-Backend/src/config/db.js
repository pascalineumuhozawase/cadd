import pg from "pg";
const { Pool } = pg;

let connectionConfig;

if (process.env.DATABASE_URL) {
  connectionConfig = { connectionString: process.env.DATABASE_URL };
} else {
  connectionConfig = {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || "cadd_db",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
  };
}

export const pool = new Pool({
  ...connectionConfig,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});
