import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
    getProductsByStoreId, // 👈 thêm

} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
// Lấy tất cả sản phẩm của 1 cửa hàng
router.get("/store/:storeId", getProductsByStoreId);

// product.route.js
router.get("/store/:storeId", async (req, res) => {
  try {
    const products = await Product.findAll({ where: { storeId: req.params.storeId } });
    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi lấy sản phẩm theo cửa hàng:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
