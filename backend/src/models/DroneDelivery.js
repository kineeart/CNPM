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
      allowNull: true,
    },

    // ⭐ Thêm tên drone
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // ⭐ Thêm tốc độ drone (m/s hoặc km/h tùy bạn dùng)
    speed: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    storeId: {
  type: DataTypes.INTEGER,
  allowNull: true,
},

  },
  {
    tableName: "dronedelivery",
    timestamps: true,
  }
);

export default DroneDelivery;
