// src/routes/droneDeliveryRoutes.js
import express from "express";
import { Order } from "../models/order.model.js";
import DroneDelivery from "../models/DroneDelivery.js";
import { Store } from "../models/store.model.js";

const router = express.Router();

const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371, toRad = d => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// =======================
// GET tất cả drone
// =======================
router.get("/", async (req, res) => {
  try {
    const drones = await DroneDelivery.findAll({
      attributes: [
        "id", "orderId", "name", "speed", "status",
        "estimatedTime", "location", "storeId", "createdAt", "updatedAt",
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
// GET drone WAITING của một cửa hàng cụ thể
// =======================
router.get("/waiting", async (req, res) => {
  try {
    const { storeId } = req.query;
    if (!storeId) {
      return res.status(400).json({ error: "Bắt buộc phải cung cấp storeId" });
    }

    const drones = await DroneDelivery.findAll({
      where: {
        status: "WAITING",
        storeId: storeId, // Lọc theo storeId
      },
      attributes: ["id", "name", "speed", "storeId"],
    });
    res.json({ message: `Danh sách drone đang rảnh của cửa hàng ${storeId}`, data: drones });
  } catch (err) {
    console.error("❌ Lỗi get waiting drones:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// POST tạo drone mới
// =======================
router.post("/", async (req, res) => {
  try {
    const { name, speed } = req.body;
    if (!name) return res.status(400).json({ error: "Tên drone bắt buộc" });

    const newDrone = await DroneDelivery.create({
      name,
      speed: speed || 0,
      status: "WAITING",
    });

    res.status(201).json({ message: "Tạo mới thành công", data: newDrone });
  } catch (err) {
    console.error("❌ Lỗi create:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// POST phân phối drone về cửa hàng
// =======================
router.post("/:id/assign", async (req, res) => {
  const { id } = req.params;
  const { storeId } = req.body;
  try {
    const drone = await DroneDelivery.findByPk(id);
    if (!drone) return res.status(404).json({ message: "Drone không tồn tại" });
    await drone.update({ storeId });
    res.json({ message: "Phân phối thành công", drone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// DELETE drone
// =======================
router.delete("/:id", async (req, res) => {
  try {
    const drone = await DroneDelivery.findByPk(req.params.id);
    if (!drone) return res.status(404).json({ error: "Drone không tồn tại" });

    if (drone.status === "FLYING") {
      return res.status(400).json({ error: "Không thể xóa drone đang bay" });
    }

    await drone.destroy();
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    console.error("❌ Lỗi remove:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/delivery/assign -> Gán drone cho đơn hàng
router.post("/assign", async (req, res) => {
  try {
    const { orderId, droneId } = req.body;
    if (!orderId || !droneId) return res.status(400).json({ message: "Thiếu orderId hoặc droneId" });

    const order = await Order.findByPk(orderId, { include: [{ model: Store, as: "Store" }] });
    const drone = await DroneDelivery.findByPk(droneId);

    if (!order || !drone) return res.status(404).json({ message: "Không tìm thấy đơn hàng hoặc drone" });
    if (drone.status !== 'WAITING') return res.status(400).json({ message: "Drone không rảnh" });
    if (!order.Store) return res.status(400).json({ message: "Đơn hàng không có thông tin cửa hàng" });

    const distanceKm = haversine(order.Store.latitude, order.Store.longitude, order.latitude, order.longitude);
    const speedKmH = Number(drone.speed) > 0 ? Number(drone.speed) : 30;
    const etaMinutes = Math.max(Math.ceil((distanceKm / speedKmH) * 60), 1);

    await drone.update({ status: "FLYING", orderId: orderId, estimatedTime: etaMinutes });
    await order.update({ status: "delivering" });

    return res.json({ message: "Đã gán drone và bắt đầu giao", etaMinutes });
  } catch (err) {
    console.error("❌ Lỗi gán drone cho đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// GET /api/delivery/progress/:orderId -> Lấy tiến trình giao hàng
router.get("/progress/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const drone = await DroneDelivery.findOne({ where: { orderId } });
    const order = await Order.findByPk(orderId, { include: [{ model: Store, as: "Store" }] });

    if (!order || !order.Store) return res.status(404).json({ message: "Không tìm thấy đơn/cửa hàng" });
    if (!drone) {
      const done = order.status === "success";
      return res.json({
        status: done ? "done" : "idle",
        progress: done ? 1 : 0,
        position: { lat: order.Store.latitude, lon: order.Store.longitude }
      });
    }

    if (drone.status !== "FLYING") {
      return res.json({ status: drone.status, progress: 0, position: { lat: order.Store.latitude, lon: order.Store.longitude } });
    }

    const startedAt = new Date(drone.updatedAt).getTime();
    const etaMs = Number(drone.estimatedTime || 0) * 60 * 1000;
    const now = Date.now();
    const progress = etaMs > 0 ? Math.min((now - startedAt) / etaMs, 1) : 1;

    const sLat = order.Store.latitude, sLon = order.Store.longitude;
    const uLat = order.latitude, uLon = order.longitude;
    const curLat = sLat + (uLat - sLat) * progress;
    const curLon = sLon + (uLon - sLon) * progress;

    return res.json({
      status: "FLYING",
      progress,
      position: { lat: curLat, lon: curLon }
    });
  } catch (err) {
    console.error("❌ Lỗi progress:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
