const jwt = require("jsonwebtoken");
const { Users } = require("../models/userModel");

/**
 * Generate a new access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user.user_id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Shorter expiry for access token
  );
};

/**
 * Generate a refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      _id: user.user_id,
      email: user.email,
      role: user.role,
      type: "refresh",
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "7d" } // Longer expiry for refresh token
  );
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

/**
 * Refresh token middleware
 */
const refreshTokenMiddleware = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        status: "error",
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if user still exists
    const user = await Users.findOne({
      where: { user_id: decoded._id },
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found",
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.status(200).json({
      status: "success",
      message: "Tokens refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: "15m",
      },
    });
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: error.message || "Invalid refresh token",
    });
  }
};

/**
 * Enhanced authorization middleware with token refresh
 */
const enhancedAuthorization = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Access token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access token is required",
      });
    }

    // Verify access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await Users.findOne({
      where: { user_id: decoded._id },
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found",
      });
    }

    // Add user info to request
    req.user = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Access token expired",
        code: "TOKEN_EXPIRED",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid access token",
        code: "INVALID_TOKEN",
      });
    } else {
      return res.status(500).json({
        status: "error",
        message: "Token verification failed",
      });
    }
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  refreshTokenMiddleware,
  enhancedAuthorization,
};
