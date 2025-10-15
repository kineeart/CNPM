import express from "express";
import { getStoreMenu } from "../controllers/menu.controller.js";

const router = express.Router();

// GET /api/stores/name/:name/menu
router.get("/stores/name/:name/menu", getStoreMenu);

export default router;
