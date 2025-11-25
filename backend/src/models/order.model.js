import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { User } from "./user.model.js";
import { Store } from "./store.model.js";  // thêm dòng này

export const Order = sequelize.define("order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  storeId: DataTypes.INTEGER,
  totalPrice: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: "pending",
  },
  note: DataTypes.STRING,
  deliveryAddress: DataTypes.STRING,
  contactPhone: DataTypes.STRING,
    latitude: DataTypes.DOUBLE,    // thêm
  longitude: DataTypes.DOUBLE,   // thêm
}, {
  tableName: "order",
  timestamps: true,
  freezeTableName: true,
});

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Order.belongsTo(Store, { foreignKey: "storeId" });
Store.hasMany(Order, { foreignKey: "storeId" });