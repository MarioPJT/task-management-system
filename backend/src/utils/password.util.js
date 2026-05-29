import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * Hashes a plain-text password using bcrypt.
 *
 * @param {string} password - Plain-text password to hash
 * @returns {Promise<string>} Bcrypt hash
 */
export const hashPassword = async (password) => {
  if (!password) throw new Error("[Password] Password is required to hash");
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plain-text password against a bcrypt hash.
 *
 * @param {string} password - Plain-text password to verify
 * @param {string} hash     - Stored bcrypt hash
 * @returns {Promise<boolean>} True if match, false otherwise
 */
export const comparePassword = async (password, hash) => {
  if (!password || !hash) throw new Error("[Password] Password and hash are required");
  return bcrypt.compare(password, hash);
};