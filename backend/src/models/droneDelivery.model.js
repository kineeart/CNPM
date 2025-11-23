// src/models/DroneDelivery.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DroneDelivery = sequelize.define("DroneDelivery", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM("WAITING","FLYING","DELIVERED","RETURNING"), defaultValue: "WAITING" },
  estimatedTime: { type: DataTypes.INTEGER, allowNull: true },
  location: { type: DataTypes.JSON, allowNull: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  speed: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 }
}, {
  tableName: "dronedelivery",
  timestamps: true
});

export default DroneDelivery;
