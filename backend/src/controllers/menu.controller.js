import { Store } from "../models/store.model.js";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";

export const getStoreMenuById = async (req, res) => {
  try {
    const { id } = req.params; // storeId
    const store = await Store.findByPk(id);
    if (!store) return res.status(404).json({ message: "❌ Cửa hàng không tồn tại" });

    const products = await Product.findAll({ where: { storeId: id } });

    res.json({
      storeId: store.id,
      storeName: store.name,
      menu: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
      })),
    });
  } catch (error) {
    console.error("🔥 Lỗi khi lấy menu:", error);
    res.status(500).json({ error: "Lỗi server khi lấy menu" });
  }
};
