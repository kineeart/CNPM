import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Order from "./order.model.js";

const DroneDelivery = sequelize.define("droneDelivery", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  droneId: { type: DataTypes.INTEGER },
  status: {
    type: DataTypes.ENUM("WAITING", "FLYING", "DELIVERED", "RETURNING"),
    defaultValue: "WAITING"
  },
  estimatedTime: { type: DataTypes.INTEGER },
  location: { type: DataTypes.JSON },
}, {
  timestamps: true
});

// 🔗 Liên kết với Order
DroneDelivery.belongsTo(Order, { foreignKey: "orderId", as: "order" });
Order.hasOne(DroneDelivery, { foreignKey: "orderId", as: "delivery" });

export default DroneDelivery;
