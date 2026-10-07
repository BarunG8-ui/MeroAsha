const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 12;

const hashPassword = async (password) => {
  if (!password) {
    throw new Error("Password is required");
  }

  return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, passwordHash) => {
  if (!password || !passwordHash) {
    return false;
  }

  return await bcrypt.compare(password, passwordHash);
};

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken
};