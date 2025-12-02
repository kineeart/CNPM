import { Product } from "../models/product.model.js";
import { Store } from "../models/store.model.js";

// 🟢 Lấy 1 sản phẩm theo id
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
      storeId: product.storeId,
    });
  } catch (error) {
    console.error("🔥 Lỗi khi lấy chi tiết món:", error);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết món" });
  }
};


// 🟢 Lấy danh sách sản phẩm
export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: ["id", "name", "storeId","name", "price", "description", "imageUrl", "isAvailable",  ], // chỉ lấy tên và id
      // bỏ include Store tạm thời để tránh lỗi
      // include: [{ model: Store, as: "store" }],
    });
    res.json(products);
  } catch (error) {
    console.error("❌ Lỗi getProducts:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách món ăn" });
  }
};



// 🟢 Tạo món ăn mới — KHÔNG còn categoryId
export const createProduct = async (req, res) => {
  try {
const userId = req.query.userId;
    const { storeId } = req.body;

    const store = await Store.findOne({
      where: { id: storeId, ownerId: userId }
    });

    if (!store) return res.status(403).json({ message: "❌ Không phải chủ cửa hàng" });

    const product = await Product.create(req.body);
    res.status(201).json(product);

  } catch (error) {
    console.error("❌ Lỗi create:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};



// 🟡 Cập nhật món ăn
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy món ăn" });

    await product.update(req.body);

    res.json({ message: "Cập nhật món ăn thành công", product });
  } catch (error) {
    console.error("❌ Lỗi updateProduct:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật món ăn" });
  }
};


// 🔴 Xóa món ăn
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy món ăn" });

    await product.destroy();
    res.json({ message: "Đã xóa món ăn" });
  } catch (error) {
    console.error("❌ Lỗi deleteProduct:", error);
    res.status(500).json({ message: "Lỗi server khi xóa món ăn" });
  }
};


// 🟢 Lấy sản phẩm theo storeId — KHÔNG còn Category
export const getProductsByStoreId = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const userId = req.query.userId;

    console.log("storeId:", storeId, "userId:", userId);

    // Tìm store theo id và owner
    const store = await Store.findOne({
      where: { id: storeId, ownerId: userId },
    });

    if (!store) {
      console.error("Không tìm thấy store hoặc không thuộc user", storeId, userId);
      return res.status(404).json({ error: "Store không tồn tại hoặc không thuộc user" });
    }

    const products = await Product.findAll({
      where: { storeId: store.id }, // an toàn: store đã tồn tại
      include: [{ model: Store, as: "store" }],
    });

    res.json(products);
  } catch (err) {
    console.error("Lỗi khi lấy sản phẩm theo cửa hàng:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};


export const getProductsByStore = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const userId = req.query.userId; // từ frontend gửi lên

    // 🔥 Kiểm tra store thuộc userId
    const store = await Store.findOne({ where: { id: storeId, ownerId: userId } });
    if (!store) return res.status(404).json({ error: "Store không tồn tại hoặc không thuộc user" });

    const products = await Product.findAll({
      where: { storeId },
      include: [{ model: Store, as: "store" }]
    });

    res.json(products);
  } catch (err) {
    console.error("Lỗi getProductsByStore:", err); // 🔥 Log lỗi thật chi tiết
    res.status(500).json({ error: "Lỗi server" });
  }
};


export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Store, as: "store" }],
    });
    res.json(products);
  } catch (error) {
    console.error("❌ Lỗi getProducts:", error);
    res.status(500).json({ message: error.message });
  }
};
