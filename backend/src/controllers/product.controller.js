import { v4 as uuidv4 } from "uuid";
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
    const { storeId, name, price, description, imageUrl, isAvailable } = req.body;

    if (!userId) return res.status(400).json({ message: "Thiếu userId" });
    if (!storeId) return res.status(400).json({ message: "Thiếu storeId" });
    if (price < 0) return res.status(400).json({ message: "Giá phải ≥ 0" });

    const store = await Store.findOne({ where: { id: storeId, ownerId: userId } });
    if (!store) return res.status(403).json({ message: "Không có quyền với cửa hàng này" });

    const product = await Product.create({
      // id: uuidv4(), // bỏ, để DB tự tăng
      storeId,
      name,
      price,
      description,
      imageUrl,
      isAvailable: isAvailable ?? true,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Lỗi create:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};



// 🟡 Cập nhật món ăn
export const updateProduct = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: "Thiếu userId" });

    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const store = await Store.findOne({ where: { id: product.storeId, ownerId: userId } });
    if (!store) return res.status(403).json({ message: "Không có quyền sửa sản phẩm" });

    if (req.body.price != null && Number(req.body.price) < 0) {
      return res.status(400).json({ message: "Giá phải ≥ 0" });
    }

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
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: "Thiếu userId" });

    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const store = await Store.findOne({ where: { id: product.storeId, ownerId: userId } });
    if (!store) return res.status(403).json({ message: "Không có quyền xóa sản phẩm" });

    await product.destroy();
    res.json({ message: "Đã xóa món ăn" });
  } catch (error) {
    console.error("❌ Lỗi deleteProduct:", error);
    res.status(500).json({ message: "Lỗi server khi xóa món ăn" });
  }
};





export const getProductsByStore = async (req, res) => {
  try {
    // 👇 SỬA: Lấy storeId hoặc id để tương thích với route
    const storeId = req.params.storeId || req.params.id;       
    const userId = req.query.userId;     

    console.log("📌 storeId =", storeId, "userId =", userId);

    if (!storeId) {
      return res.status(400).json({ error: "Thiếu storeId!" });
    }
    if (!userId) {
      return res.status(400).json({ error: "Thiếu userId!" });
    }

    // Kiểm tra quyền sở hữu
    const store = await Store.findOne({
      where: { id: storeId, ownerId: userId }
    });

    if (!store) {
      return res.status(403).json({ error: "User không sở hữu cửa hàng này!" });
    }

    // Lấy danh sách sản phẩm
    const products = await Product.findAll({
      where: { storeId }
    });

    return res.json(products);

  } catch (err) {
    console.error("❌ Lỗi khi lấy sản phẩm theo cửa hàng:", err);
    return res.status(500).json({ error: "Lỗi server" });
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

// 🟢 Public: lấy sản phẩm theo store cho mọi người dùng
export const getPublicProductsByStore = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId) return res.status(400).json({ message: "Thiếu storeId" });

    const products = await Product.findAll({
      where: { storeId, isAvailable: true },
      attributes: ["id","storeId","name","price","description","imageUrl","isAvailable"]
    });

    return res.json(products);
  } catch (error) {
    console.error("❌ Lỗi getPublicProductsByStore:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
