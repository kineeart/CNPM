import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { User } from "./user.model.js";

export const PaymentMethod = sequelize.define("paymentmethod", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  cardNumber: DataTypes.STRING,
  expiryDate: DataTypes.STRING,
  cardHolderName: DataTypes.STRING,
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: "paymentmethod",
  freezeTableName: true,
  timestamps: true
});

User.hasMany(PaymentMethod, { foreignKey: "userId" });
PaymentMethod.belongsTo(User, { foreignKey: "userId" });
