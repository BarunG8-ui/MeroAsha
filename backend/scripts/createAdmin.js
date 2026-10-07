require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../src/models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    const email = "admin@meroasha.com";
    const password = "Admin@12345";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      existingAdmin.passwordHash = await bcrypt.hash(password, 12);
      existingAdmin.role = "ADMIN";
      existingAdmin.active = true;

      await existingAdmin.save();

      console.log("Existing admin account updated successfully");
    } else {
      const passwordHash = await bcrypt.hash(password, 12);

      await User.create({
        name: "MeroAsha Administrator",
        email,
        phone: "9800000000",
        passwordHash,
        role: "ADMIN",
        active: true,
      });

      console.log("Admin account created successfully");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createAdmin();
