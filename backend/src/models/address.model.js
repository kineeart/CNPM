// backend/src/models/address.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js"; // nhớ import sequelize instance
import { User } from "./user.model.js"; // liên kết với bảng user

export const Address = sequelize.define(
  "Address",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE", // tự động xóa khi user bị xóa
      onUpdate: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ward: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    district: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "address",
    timestamps: true,
  }
);

// Thiết lập quan hệ (nếu muốn dùng include)
User.hasMany(Address, { foreignKey: "userId", as: "addresses" });
Address.belongsTo(User, { foreignKey: "userId", as: "user" });
