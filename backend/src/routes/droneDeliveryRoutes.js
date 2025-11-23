// src/routes/droneDeliveryRoutes.js
import express from "express";
import { getAll, getById, create, update, remove } from "../controllers/droneDeliveryController.js";

const router = express.Router();

router.get("/drone-delivery", getAll);
router.get("/drone-delivery/:id", getById);
router.post("/drone-delivery", create);
router.put("/drone-delivery/:id", update);
router.delete("/drone-delivery/:id", remove);

export default router;
