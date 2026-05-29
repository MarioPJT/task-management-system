import jwt from "jsonwebtoken";
import {
  JWT_SECRET,
  JWT_EXPIRES,
  REFRESH_SECRET,
  REFRESH_EXPIRES,
} from "../config/jwt.js";

/**
 * Generates a signed access token for the given user.
 *
 * @param {{ id: string, email: string, role: string }} user
 * @returns {string} Signed JWT access token
 */
export const generateAccessToken = (user) => {
  const payload = {
    sub:   user.id,
    email: user.email,
    role:  user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

/**
 * Generates a signed refresh token for the given user.
 *
 * @param {{ id: string, email: string, role: string }} user
 * @returns {string} Signed JWT refresh token
 */
export const generateRefreshToken = (user) => {
  const payload = {
    sub:   user.id,
    email: user.email,
    role:  user.role,
  };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
};

/**
 * Verifies and decodes an access token.
 *
 * @param {string} token
 * @returns {{ sub: string, email: string, role: string, iat: number, exp: number }}
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Verifies and decodes a refresh token.
 *
 * @param {string} token
 * @returns {{ sub: string, email: string, role: string, iat: number, exp: number }}
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};