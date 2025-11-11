import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { CartItem } from "./cartItem.model.js";
import { User } from "./user.model.js";
import { Product } from "./product.model.js";

export const Cart = sequelize.define("cart", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalPrice: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  totalPrice: {
  type: DataTypes.INTEGER,
  defaultValue: 0,
},

}, {
  tableName: "cart",
  freezeTableName: true,
  timestamps: false,
});

// Quan hệ User → Cart
User.hasMany(Cart, { foreignKey: "userId" });
Cart.belongsTo(User, { foreignKey: "userId" });

// Quan hệ Cart → CartItem

Cart.hasMany(CartItem, { foreignKey: "cartId", as: "cartitems", onDelete: "CASCADE" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

// Quan hệ Product → CartItem
Product.hasMany(CartItem, { foreignKey: "productId" });
CartItem.belongsTo(Product, { foreignKey: "productId" });

