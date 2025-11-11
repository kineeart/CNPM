import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { User } from "./user.model.js";

export const Store = sequelize.define(
  "Store",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    avatar: {
      type: DataTypes.STRING,
    },
    cover: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    ward: {
      type: DataTypes.STRING,
    },
    district: {
      type: DataTypes.STRING,
    },
    province: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "Store",
    timestamps: true,
  }
);

// ✅ Quan hệ: Một User (Admin) có nhiều Store
User.hasMany(Store, { foreignKey: "ownerId", as: "stores" });
Store.belongsTo(User, { foreignKey: "ownerId", as: "owner" });
