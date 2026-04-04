// Backend/config/seed.js
import mongoose from "mongoose";
import AdminModel from "../models/Adminisator/AdminModel.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const adminAccount = {
  firstName: "System",
  lastName: "Admin",
  email: "admin@example.com",
  mobile: "0770000000",
  password: "Admin@12345",
  twoFactorAuthSecret: null,
  status: 1,
};

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected Successfully");

    const hashedAdminPassword = await bcrypt.hash(adminAccount.password, 8);
    await AdminModel.findOneAndUpdate(
      { email: adminAccount.email },
      {
        $set: {
          ...adminAccount,
          password: hashedAdminPassword,
        },
      },
      { upsert: true, new: true }
    );
    console.log("Default admin account seeded successfully");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding database:", error);
    await mongoose.disconnect();
  }
}

seedDatabase();