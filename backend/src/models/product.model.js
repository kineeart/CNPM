import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Store } from "./store.model.js";
import { Category } from "./category.model.js";

export const Product = sequelize.define(
  "product",
  {
    id: {
      type: DataTypes.STRING, // dữ liệu demo dùng 'P1', 'P2'...
      primaryKey: true,
    },
    storeId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: Store, key: "id" },
    },
    categoryId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: Category, key: "id" },
    },
    sku: DataTypes.STRING,
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    description: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "product",
    freezeTableName: true,
    timestamps: false,
  }
);

// 🔗 Quan hệ
Store.hasMany(Product, { foreignKey: "storeId", onDelete: "CASCADE" });
Product.belongsTo(Store, { foreignKey: "storeId" });

Category.hasMany(Product, { foreignKey: "categoryId", onDelete: "CASCADE" });
Product.belongsTo(Category, { foreignKey: "categoryId" });
