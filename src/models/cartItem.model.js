import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Cart } from "./cart.model.js";
import { Product } from "./product.model.js";

export const CartItem = sequelize.define("cartitem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  productPrice: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  totalItemPrice: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.quantity * this.productPrice;
    },
    set(value) {
      throw new Error("Không thể set giá trị totalItemPrice trực tiếp");
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "cartitem",
  freezeTableName: true,
  timestamps: false,
});

// 🔗 Quan hệ
Cart.hasMany(CartItem, { foreignKey: "cartId", onDelete: "CASCADE" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

Product.hasMany(CartItem, { foreignKey: "productId" });
CartItem.belongsTo(Product, { foreignKey: "productId" });
