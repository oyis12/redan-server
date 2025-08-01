import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO);
    console.log("✅ Database connected successfully");
  } catch (err) {
     console.log("❌ Database connection failed", err.message);
        process.exit(1);
  }
};