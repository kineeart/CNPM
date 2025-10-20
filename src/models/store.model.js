import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Store = sequelize.define(
  "store",
  {
    id: {
      type: DataTypes.STRING, // vì dữ liệu demo dùng 'S1'
      primaryKey: true,
    },
    ownerId: DataTypes.STRING,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    avatar: DataTypes.STRING,
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
    tableName: "store",
    freezeTableName: true,
    timestamps: false,
  }
);
