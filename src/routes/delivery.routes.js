import express from "express";
import { updateDeliveryStatus } from "../controllers/delivery.controller.js";

const router = express.Router();

// PUT /api/delivery/:orderId/status
router.put("/:orderId/status", updateDeliveryStatus);

export default router;
