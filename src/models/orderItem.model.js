import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Order } from "./order.model.js";
import { Product } from "./product.model.js";

export const OrderItem = sequelize.define("orderitem", {
  id: {
  type: DataTypes.INTEGER,
    autoIncrement: true, // ✅ Tự tăng
    primaryKey: true,

  },
  orderId: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  productId: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  productName: DataTypes.STRING,
  productPrice: DataTypes.INTEGER,
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  tableName: "orderitem",  // 👈 khớp tên bảng MySQL
  freezeTableName: true,
  timestamps: false,
});

// Quan hệ
Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });
