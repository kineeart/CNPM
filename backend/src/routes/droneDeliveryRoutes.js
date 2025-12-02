// src/routes/droneDeliveryRoutes.js
import express from "express";
import { Order } from "../models/order.model.js";
import DroneDelivery from "../models/DroneDelivery.js";
import { Store } from "../models/store.model.js";

const router = express.Router();

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371, toRad = d => (d * Math.PI)/180;
  const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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
    const etaMinutes = Math.max(Math.ceil(distanceKm / (drone.speed || 30) * 30), 1);

    await drone.update({ status: "FLYING", orderId: orderId, estimatedTime: etaMinutes });
    await order.update({ status: "delivering" });

    return res.json({ message: "Đã gán drone và bắt đầu giao", etaMinutes });
  } catch (err) {
    console.error("❌ Lỗi gán drone cho đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// GET /api/delivery/progress/:orderId -> Lấy tiến trình giao hàng
router.get("/delivery/progress/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const drone = await DroneDelivery.findOne({ where: { orderId } });
    const order = await Order.findByPk(orderId, { include: [{ model: Store, as: "Store" }] });

    if (!order || !order.Store) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng hoặc thông tin cửa hàng" });
    }

    // Nếu không có drone, có thể đơn hàng chưa được giao hoặc đã hoàn thành
    if (!drone) {
      const isDone = order.status === "success";
      return res.json({
        status: isDone ? "done" : "idle",
        progress: isDone ? 1 : 0,
        position: { lat: order.Store.latitude, lon: order.Store.longitude }
      });
    }

    // Nếu drone không đang bay
    if (drone.status !== "FLYING") {
      return res.json({ status: drone.status, progress: 0, position: { lat: order.Store.latitude, lon: order.Store.longitude } });
    }

    // Tính toán tiến trình và vị trí
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
    console.error("❌ Lỗi lấy tiến trình giao hàng:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.post("/drone-delivery/:id/start", async (req, res) => {
  const { id } = req.params;
  const { orderId } = req.body;

  const drone = await Drone.findByPk(id, { include: [Store] });
  const order = await Order.findByPk(orderId);

  drone.status = "FLYING";
  await drone.save();

  // Hàm mô phỏng bay bất đồng bộ
  startDeliveryProcess(drone, order);

  return res.json({ message: "Drone đã bắt đầu giao hàng" });
});


async function startDeliveryProcess(drone, order) {
  const store = drone.Store;

  // 1️⃣ Bay đến khách
  await flyDrone(drone, store.latitude, store.longitude, order.latitude, order.longitude);

  // 2️⃣ Đến nơi → giao hàng
  drone.status = "DELIVERED";
  await drone.save();

  // Chờ 5 giây mô phỏng giao
  await wait(5000);

  // 3️⃣ Bắt đầu quay về store
  drone.status = "RETURNING";
  await drone.save();

  // 4️⃣ Bay về store
  await flyDrone(drone, order.latitude, order.longitude, store.latitude, store.longitude);

  // 5️⃣ Về đến nơi
  drone.status = "WAITING";
  drone.currentLat = store.latitude;
  drone.currentLng = store.longitude;
  await drone.save();
}

async function flyDrone(drone, fromLat, fromLng, toLat, toLng) {
  const steps = 200;   // càng nhiều drone càng mượt
  const delay = 50;    // tốc độ update càng nhỏ càng mượt

  for (let i = 0; i <= steps; i++) {
    const lat = fromLat + (toLat - fromLat) * (i / steps);
    const lng = fromLng + (toLng - fromLng) * (i / steps);

    drone.currentLat = lat;
    drone.currentLng = lng;
    await drone.save();

    await wait(delay);
  }
}

router.post("/drone-delivery/:id/cancel", async (req, res) => {
  const { id } = req.params;

  const drone = await Drone.findByPk(id, { include: [Store] });

  if (drone.status === "FLYING") {
    drone.status = "RETURNING";
    await drone.save();

    const store = drone.Store;

    // Bay từ vị trí hiện tại về store
    flyDrone(drone, drone.currentLat, drone.currentLng, store.latitude, store.longitude)
      .then(async () => {
        drone.status = "WAITING";
        await drone.save();
      });
  }

  return res.json({ message: "Drone sẽ quay về" });
});

// =======================
// POST cập nhật status của drone
// =======================
router.post("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Trạng thái (status) là bắt buộc" });
  }

  try {
    const drone = await DroneDelivery.findByPk(id);
    if (!drone) {
      return res.status(404).json({ error: "Drone không tồn tại" });
    }

    // Nếu chuyển sang WAITING, xóa orderId
    const updateData = { status };
    if (status === "WAITING") {
      updateData.orderId = null;
    }

    await drone.update(updateData);
    res.json({ message: `Cập nhật trạng thái drone thành ${status}`, drone });
  } catch (err) {
    console.error("❌ Lỗi cập nhật status drone:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// PUT cập nhật drone
// =======================
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, speed } = req.body;

  try {
    const drone = await DroneDelivery.findByPk(id);
    if (!drone) {
      return res.status(404).json({ error: "Drone không tồn tại" });
    }

    // Chỉ cập nhật các trường được cung cấp
    if (name) drone.name = name;
    if (speed !== undefined) drone.speed = speed;

    await drone.save();
    res.json({ message: "Cập nhật drone thành công", data: drone });
  } catch (err) {
    console.error("❌ Lỗi cập nhật drone:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
