import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Order } from "./order.model.js";

export const Payment = sequelize.define("payment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  method: {
    // Thêm BANK_TRANSFER vào các phương thức thanh toán được hỗ trợ
    type: DataTypes.ENUM("CARD", "CASH", "WALLET", "BANK_TRANSFER"),
    allowNull: false
  },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
    defaultValue: "PENDING"
  },
  transactionId: DataTypes.STRING
}, {
  tableName: "payment",
  freezeTableName: true,
  timestamps: true
});

Order.hasOne(Payment, { foreignKey: "orderId" });
Payment.belongsTo(Order, { foreignKey: "orderId" });
