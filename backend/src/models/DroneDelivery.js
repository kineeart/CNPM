// src/models/DroneDelivery.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const DroneDelivery = sequelize.define(
  "dronedelivery",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    droneId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("WAITING", "FLYING", "DELIVERED", "RETURNING"),
      defaultValue: "WAITING",
    },

    estimatedTime: {
      type: DataTypes.INTEGER, // phút
      allowNull: true,
    },

    location: {
      type: DataTypes.STRING, // "lat,lng"
      allowNull: true,
    },
  },
  {
    tableName: "dronedelivery", // ép dùng đúng tên bảng
    timestamps: true, // nếu bảng bạn không có createdAt & updatedAt
  }
);

export default DroneDelivery;
