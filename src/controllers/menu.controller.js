import { Store } from "../models/store.model.js";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";

export const getStoreMenu = async (req, res) => {
  try {
    const { name } = req.params;

    // 🔎 Tìm cửa hàng theo tên
    const store = await Store.findOne({ where: { name } });
    if (!store) return res.status(404).json({ message: "❌ Cửa hàng không tồn tại" });

    // 🔎 Lấy danh mục + sản phẩm thuộc cửa hàng đó
    const categories = await Category.findAll({
      include: [
        {
          model: Product,
          where: { storeId: store.id },
          required: false,
        },
      ],
    });

    const menu = categories.map((cat) => ({
      category: cat.name,
      items: cat.products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        imageUrl: p.imageUrl,
      })),
    }));

    res.json({
      storeId: store.id,
      storeName: store.name,
      menu,
    });
  } catch (error) {
    console.error("🔥 Lỗi khi lấy menu:", error);
    res.status(500).json({ error: "Lỗi server khi lấy menu" });
  }
};
