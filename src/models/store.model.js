
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Store = sequelize.define("store", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.STRING,
  avatar: DataTypes.STRING,
  cover: DataTypes.STRING,
  address: DataTypes.STRING,
  ward: DataTypes.STRING,
  district: DataTypes.STRING,
  province: DataTypes.STRING,
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
},
 {
    tableName: "store", // 🔥 chỉ rõ đúng tên bảng trong MySQL
    timestamps: false,  // 🔇 nếu bảng không có createdAt, updatedAt
  });

