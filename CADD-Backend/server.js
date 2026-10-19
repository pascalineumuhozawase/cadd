
import "dotenv/config";
import app from "./src/app.js";
import { pool } from "./src/config/db.js";

async function startServer() {
  try {
    const result = await pool.query("SELECT current_database() AS database");
    const port = Number(process.env.PORT || 5000);

    app.listen(port, () => {
      console.log(`Connected to PostgreSQL database: ${result.rows[0].database}`);
      console.log(`CADD backend running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error.message);
    await pool.end();
    process.exit(1);
  }
}

startServer();
