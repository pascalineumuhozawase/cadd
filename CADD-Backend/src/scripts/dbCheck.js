import "dotenv/config";
import { pool } from "../config/db.js";

try {
  const result = await pool.query("SELECT current_database() AS database, NOW() AS server_time");
  console.log("Database connection successful:", result.rows[0]);
  const tables = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users','predictions') ORDER BY table_name"
  );
  console.log("CADD tables found:", tables.rows.map(r => r.table_name).join(", ") || "none; run database/schema.sql");
} catch (error) {
  console.error("Database check failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
