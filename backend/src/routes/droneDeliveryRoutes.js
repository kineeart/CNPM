import express from "express";
import droneDeliveryController from "../controllers/droneDeliveryController.js";
import { getWaitingDrones, assignDrone } from "../controllers/droneDeliveryController.js";

const router = express.Router();

router.get("/drone-delivery", droneDeliveryController.getAll);
router.post("/drone-delivery", droneDeliveryController.create);
router.get("/drone-delivery/:id", droneDeliveryController.getById);
router.put("/drone-delivery/:id", droneDeliveryController.update);
router.delete("/drone-delivery/:id", droneDeliveryController.remove);
router.get("/drones/waiting", getWaitingDrones);
router.post("/drones/assign", assignDrone);

export default router;
