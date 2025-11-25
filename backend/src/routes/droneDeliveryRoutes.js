// src/routes/droneDeliveryRoutes.js
import express from "express";
import DroneDelivery from "../models/DroneDelivery.js";

const router = express.Router();

// =======================
// GET tất cả drone
// =======================
router.get("/drone-delivery", async (req, res) => {
  try {
    const drones = await DroneDelivery.findAll({
      attributes: [
        "id",
        "orderId",
        "name",
        "speed",
        "status",
        "estimatedTime",
        "location",
        "createdAt",
        "updatedAt",
      ],
    });
    res.json({ message: "Danh sách Drone Delivery", data: drones });
  } catch (err) {
    console.error("❌ Lỗi getAll:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET drone theo ID
// =======================
router.get("/drone-delivery/:id", async (req, res) => {
  try {
    const drone = await DroneDelivery.findByPk(req.params.id);
    if (!drone) return res.status(404).json({ error: "Drone không tồn tại" });
    res.json(drone);
  } catch (err) {
    console.error("❌ Lỗi getById:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET drone WAITING

router.get("/waiting", async (req, res) => {
  try {
    const waitingDrones = await DroneDelivery.findAll({
      where: { status: "WAITING" },
    });
    res.json({ message: "Danh sách Drone WAITING", data: waitingDrones });
  } catch (err) {
    console.error("❌ Lỗi getWaiting:", err);
    res.status(500).json({ error: err.message });
  }
});


// =======================
// POST tạo drone mới
// =======================
router.post("/drone-delivery", async (req, res) => {
  try {
    const { name, speed } = req.body;
    if (!name) return res.status(400).json({ error: "Tên drone bắt buộc" });

    const newDrone = await DroneDelivery.create({
      name,
      speed: speed || 0,
      orderId: null,
      status: "WAITING",
      estimatedTime: null,
      location: null,
    });

    res.json({ message: "Tạo mới thành công", data: newDrone });
  } catch (err) {
    console.error("❌ Lỗi create:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// PUT cập nhật drone
// =======================
router.put("/drone-delivery/:id", async (req, res) => {
  try {
    const [updatedRows] = await DroneDelivery.update(req.body, {
      where: { id: req.params.id },
    });
    if (updatedRows === 0)
      return res.status(404).json({ error: "Drone không tồn tại" });
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ Lỗi update:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// DELETE drone
// =======================
router.delete("/drone-delivery/:id", async (req, res) => {
  try {
    const drone = await DroneDelivery.findByPk(req.params.id);
    if (!drone) return res.status(404).json({ error: "Drone không tồn tại" });

    if (["FLYING", "RETURNING", "DELIVERED"].includes(drone.status)) {
      return res
        .status(400)
        .json({ error: `Không thể xóa drone đang ${drone.status}` });
    }

    await DroneDelivery.destroy({ where: { id: req.params.id } });
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    console.error("❌ Lỗi remove:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

// =======================
// POST gán drone cho order
// =======================
router.post("/assign", async (req, res) => {
  try {
    const { orderId, droneId } = req.body;
    if (!orderId || !droneId) {
      return res.status(400).json({ error: "Thiếu orderId hoặc droneId" });
    }

    const drone = await DroneDelivery.findByPk(droneId);
    if (!drone) return res.status(404).json({ error: "Drone không tồn tại" });

    if (drone.status !== "WAITING") {
      return res.status(400).json({ error: "Drone đang bận" });
    }

    // Gán drone cho order
    drone.orderId = orderId;
    drone.status = "FLYING"; // hoặc trạng thái bạn muốn
    await drone.save();

    res.json({ message: "🚁 Drone đã được gán cho đơn hàng", drone });
  } catch (err) {
    console.error("❌ Lỗi assign drone:", err);
    res.status(500).json({ error: err.message });
  }
});
