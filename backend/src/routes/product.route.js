import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByStore, // 👈 thêm
  getPublicProductsByStore, // Thêm vào đây
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Lấy sản phẩm của 1 cửa hàng (private: cần userId là owner)
router.get("/store/:storeId", getProductsByStore);

// Lấy sản phẩm public cho StoreDetail (không cần userId)
router.get("/store/:storeId/public", getPublicProductsByStore);

export default router;
