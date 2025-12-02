import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Store } from "./store.model.js";

// product.model.js
export const Product = sequelize.define(
  "product",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    storeId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: Store, key: "id" },
    },
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



Store.hasMany(Product, { foreignKey: "storeId", as: "products" });
Product.belongsTo(Store, { foreignKey: "storeId", as: "store" });




