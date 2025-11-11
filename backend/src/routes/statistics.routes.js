import express from "express";
import { getRestaurantStatistics } from "../controllers/statistics.controller.js";

const router = express.Router();

// GET /api/statistics/restaurant/:id?period=day|month
router.get("/restaurant/:id", getRestaurantStatistics);

export default router;
