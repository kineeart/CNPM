// src/config/database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình kết nối MySQL
export const sequelize = new Sequelize(
  process.env.DB_NAME || "fastfood_drone_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "1234567",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false, // tắt log SQL
  }
);
console.log("🧠 Connected DB:", sequelize.getDatabaseName());

// Hàm kiểm tra kết nối
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
};
