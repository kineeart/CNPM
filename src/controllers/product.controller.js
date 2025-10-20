import { Product } from "../models/product.model.js";

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "❌ Món ăn không tồn tại" });
    }

    res.json({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
    });
  } catch (error) {
    console.error("🔥 Lỗi khi lấy chi tiết món:", error);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết món" });
  }
};
