// src/models/user.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const User = sequelize.define("user", {
  id: {
  type: DataTypes.INTEGER,
  primaryKey: true,
  autoIncrement: true
},

  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  avatar: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.ENUM("CUSTOMER", "STORE_ADMIN", "DRONE_OPERATOR"),
    defaultValue: "CUSTOMER",
  },
  status: {
    type: DataTypes.ENUM("ACTIVE", "INACTIVE", "BANNED"),
    defaultValue: "ACTIVE",
  },
}, {
    tableName: "user",       // 👈 dùng đúng tên bảng trong DB
    freezeTableName: true,   // 👈 không tự thêm “s”
    timestamps: true,
}
);
