import { query } from "../config/db.js";

/**
 * Creates a new user in the database.
 *
 * @param {{ fullName: string, email: string, passwordHash: string, role?: string }} data
 * @returns {Promise<object>} Created user row (without password_hash)
 */
export const createUser = async ({ fullName, email, passwordHash, role = "USER" }) => {
  const sql = `
    INSERT INTO users (full_name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, full_name, email, role, created_at
  `;
  const { rows } = await query(sql, [fullName, email, passwordHash, role]);
  return rows[0];
};

/**
 * Finds a user by email address.
 * Returns the full row including password_hash for auth comparison.
 *
 * @param {string} email
 * @returns {Promise<object|null>} User row or null if not found
 */
export const findByEmail = async (email) => {
  const sql = `
    SELECT id, full_name, email, password_hash, role, is_active, created_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;
  const { rows } = await query(sql, [email]);
  return rows[0] ?? null;
};

/**
 * Finds a user by their UUID.
 * Does not return password_hash.
 *
 * @param {string} id - UUID
 * @returns {Promise<object|null>} User row or null if not found
 */
export const findById = async (id) => {
  const sql = `
    SELECT id, full_name, email, role, is_active, created_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;
  const { rows } = await query(sql, [id]);
  return rows[0] ?? null;
};