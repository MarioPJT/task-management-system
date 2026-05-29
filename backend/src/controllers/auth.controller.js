import { registerUser, loginUser } from "../services/auth.service.js";

/**
 * POST /api/v1/auth/register
 * Registers a new user and returns tokens.
 */
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    const { user, accessToken, refreshToken } = await registerUser({
      fullName,
      email,
      password,
      role,
    });

    res.status(201).json({
      status:  "success",
      message: "User registered successfully",
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/login
 * Authenticates a user and returns tokens.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await loginUser({
      email,
      password,
    });

    res.status(200).json({
      status:  "success",
      message: "Login successful",
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};