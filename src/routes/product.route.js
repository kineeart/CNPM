import express from "express";
import { getProductById } from "../controllers/product.controller.js";

const router = express.Router();

// ✅ API: /api/products/:id
router.get("/products/:id", getProductById);

export default router;
