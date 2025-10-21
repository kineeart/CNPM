import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Store } from "./store.model.js";
import { User } from "./user.model.js";

export const Order = sequelize.define("order", {
  id: {
     type: DataTypes.INTEGER,
    autoIncrement: true, // ✅ Tự tăng
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  storeId: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: "pending",
  },
  totalPrice: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  note: DataTypes.STRING,
  deliveryAddress: DataTypes.STRING,
  contactPhone: DataTypes.STRING,
}, {
  tableName: "order",      // 🔥 phải khớp với bảng trong MySQL
  freezeTableName: true,   // không thêm "s"
  timestamps: false,
});

// Quan hệ
User?.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Store.hasMany(Order, { foreignKey: "storeId" });
Order.belongsTo(Store, { foreignKey: "storeId" });
