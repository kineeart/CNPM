// routes/menu.routes.js
import express from "express";
import { getStoreMenuById } from "../controllers/menu.controller.js";

const router = express.Router();

// GET /api/stores/:storeId/products
router.get("/stores/:id/products", getStoreMenuById);

export default router;
