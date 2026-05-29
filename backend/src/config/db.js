import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Production-ready pool settings
  max: 20,                 // max connections in pool
  idleTimeoutMillis: 30000, // close idle connections after 30s
  connectionTimeoutMillis: 5000, // fail fast if no connection in 5s
  allowExitOnIdle: false,  // keep pool alive in production
});

// Log pool-level errors to prevent unhandled exceptions
pool.on("error", (err) => {
  console.error("[DB] Unexpected error on idle client:", err.message);
  process.exit(1);
});

/**
 * Test the database connection on startup.
 * Throws if the DB is unreachable so the process fails loudly.
 */
export const connectDB = async () => {
  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query("SELECT NOW() AS connected_at");
    console.log(`[DB] Connected to PostgreSQL at ${rows[0].connected_at}`);
  } catch (err) {
    console.error("[DB] Connection failed:", err.message);
    throw err;
  } finally {
    client?.release();
  }
};

/**
 * Execute a single query using the pool.
 *
 * @param {string} text   - SQL query string (use $1, $2 … for params)
 * @param {Array}  params - Parameterized values (optional)
 * @returns {Promise<import("pg").QueryResult>}
 */
export const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DB] query="${text}" duration=${duration}ms rows=${result.rowCount}`);
    }

    return result;
  } catch (err) {
    console.error(`[DB] Query error: ${err.message} | query="${text}"`);
    throw err;
  }
};

/**
 * Acquire a dedicated client for transactions.
 * Always call client.release() in a finally block.
 *
 * @example
 * const client = await getClient();
 * try {
 *   await client.query("BEGIN");
 *   await client.query("INSERT INTO ...");
 *   await client.query("COMMIT");
 * } catch (err) {
 *   await client.query("ROLLBACK");
 *   throw err;
 * } finally {
 *   client.release();
 * }
 *
 * @returns {Promise<import("pg").PoolClient>}
 */
export const getClient = async () => {
  try {
    return await pool.connect();
  } catch (err) {
    console.error("[DB] Failed to acquire client:", err.message);
    throw err;
  }
};

export default pool;