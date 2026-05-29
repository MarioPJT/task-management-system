import "dotenv/config";

const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`[JWT Config] Missing required env variable: ${key}`);
  return value;
};

export const JWT_SECRET      = required("JWT_SECRET");
export const JWT_EXPIRES     = process.env.JWT_EXPIRES     || "15m";
export const REFRESH_SECRET  = required("REFRESH_SECRET");
export const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES || "7d";