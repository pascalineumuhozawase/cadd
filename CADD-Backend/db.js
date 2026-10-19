
import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "cassava_cadd_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD
});

pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error.message);
});

export async function testConnection() {
  const result = await pool.query(
    "SELECT current_database() AS database, NOW() AS time"
  );

  console.log(
    "Database connection successful:",
    result.rows[0]
  );
}
