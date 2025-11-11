import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js"; // ✅ thêm dòng này

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


export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, as: "category" }],
    });
    res.json(products);
  } catch (error) {
    console.error("❌ Lỗi getProducts:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách món ăn" });
  }
};


// 🟢 Tạo món ăn mới
export const createProduct = async (req, res) => {
  try {
    const { storeId, name, price, description, imageUrl, categoryId } = req.body;
    const product = await Product.create({ storeId, name, price, description, imageUrl, categoryId });
    res.status(201).json({ message: "Thêm món ăn thành công", product });
  } catch (error) {
    console.error("❌ Lỗi createProduct:", error);
    res.status(500).json({ message: "Không thể thêm món ăn" });
  }
};

// 🟡 Cập nhật món ăn
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy món ăn" });
    await product.update(req.body);
    res.json({ message: "Cập nhật món ăn thành công", product });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi cập nhật món ăn" });
  }
};

// 🔴 Xóa món ăn
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy món ăn" });
    await product.destroy();
    res.json({ message: "Đã xóa món ăn" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi xóa món ăn" });
  }
};

export const getProductsByStoreId = async (req, res) => {
  try {
    const { storeId } = req.params;
    const products = await Product.findAll({
      where: { storeId },
      include: [{ model: Category, as: "category" }],
    });
    res.json(products);
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm theo cửa hàng:", error);
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm" });
  }
};
