import { createUser, findByEmail } from "../repositories/auth.repository.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.util.js";

/**
 * Registers a new user.
 *
 * @param {{ fullName: string, email: string, password: string, role?: string }} data
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 * @throws {Error} If email is already in use
 */
export const registerUser = async ({ fullName, email, password, role }) => {
  const existing = await findByEmail(email);
  if (existing) {
    const err = new Error("Email is already registered");
    err.status = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ fullName, email, passwordHash, role });

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};

/**
 * Authenticates an existing user.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 * @throws {Error} If credentials are invalid or account is inactive
 */
export const loginUser = async ({ email, password }) => {
  const user = await findByEmail(email);
  if (!user) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error("Account is disabled");
    err.status = 403;
    throw err;
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const { password_hash: _, ...safeUser } = user;

  const accessToken  = generateAccessToken(safeUser);
  const refreshToken = generateRefreshToken(safeUser);

  return { user: safeUser, accessToken, refreshToken };
};