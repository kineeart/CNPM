import express from "express";
import { createOrder } from "../controllers/order.controller.js";

const router = express.Router();

// POST /api/orders
router.post("/", createOrder);

export default router;
