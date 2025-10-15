import { Store } from "./store.model.js";
import { Category } from "./category.model.js";
import { Product } from "./product.model.js";

// Store – Product
Store.hasMany(Product, { foreignKey: "storeId" });
Product.belongsTo(Store, { foreignKey: "storeId" });

// Category – Product
Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

console.log("✅ Associations initialized!");
