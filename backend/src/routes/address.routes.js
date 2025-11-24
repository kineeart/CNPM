import express from "express";
import { getAddresses, addOrUpdateAddress } from "../controllers/address.controller.js";

const router = express.Router();

router.get("/:userId", getAddresses);
router.post("/:userId", addOrUpdateAddress);


export default router;
