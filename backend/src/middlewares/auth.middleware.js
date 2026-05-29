import { verifyAccessToken } from "../utils/jwt.util.js";

/**
 * Middleware: verifies the JWT Bearer token from the Authorization header.
 * Attaches the decoded payload to req.user on success.
 *
 * @throws {401} If token is missing, malformed, expired, or invalid
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      status:  "error",
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id:    payload.sub,
      email: payload.email,
      role:  payload.role,
    };
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token has expired. Please log in again."
        : "Invalid token.";

    return res.status(401).json({
      status: "error",
      message,
    });
  }
};

export default authMiddleware;