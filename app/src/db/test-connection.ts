import { Pool } from "pg";

async function testConnection() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() AS now");
    console.log("DB connected successfully. Server time:", result.rows[0].now);
    client.release();
  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
