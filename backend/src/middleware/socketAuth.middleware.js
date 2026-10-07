const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token is required"));
    }

    if (!process.env.JWT_SECRET) {
      return next(new Error("JWT secret is not configured"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-passwordHash");

    if (!user) {
      return next(new Error("User not found"));
    }

    if (!user.active) {
      return next(new Error("User account is inactive"));
    }

    socket.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new Error("Authentication token has expired"));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new Error("Invalid authentication token"));
    }

    next(new Error("Socket authentication failed"));
  }
};

module.exports = {
  authenticateSocket,
};
