import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Category = sequelize.define(
  "category",
  {
    id: {
      type: DataTypes.STRING, // vì dữ liệu demo dùng 'C1', 'C2', 'C3'
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "category",
    freezeTableName: true,
    timestamps: false,
  }
);
