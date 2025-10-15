import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Store } from "./store.model.js";

export const Category = sequelize.define("category", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Store,
      key: "id",
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// 🔗 Quan hệ
Store.hasMany(Category, { foreignKey: "storeId", onDelete: "CASCADE" });
Category.belongsTo(Store, { foreignKey: "storeId" });
