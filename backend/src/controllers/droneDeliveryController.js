// src/controllers/droneDeliveryController.js
import DroneDelivery from "../models/DroneDelivery.js";

// Lấy danh sách tất cả drone
export const getAll = async (req, res) => {
  try {
    const drones = await DroneDelivery.findAll({
      attributes: ["id", "orderId", "name", "speed", "status", "estimatedTime", "location", "createdAt", "updatedAt"]
    });
    res.json({ message: "Danh sách Drone Delivery", data: drones });
  } catch (err) {
    console.error("❌ Lỗi getAll:", err);
    res.status(500).json({ error: err.message });
  }
};

// Lấy drone theo ID
export const getById = async (req, res) => {
  try {
    const drone = await DroneDelivery.findByPk(req.params.id);
    if (!drone) return res.status(404).json({ error: "Drone không tồn tại" });
    res.json(drone);
  } catch (err) {
    console.error("❌ Lỗi getById:", err);
    res.status(500).json({ error: err.message });
  }
};

// Tạo mới drone
export const create = async (req, res) => {
  try {
    const { name, speed } = req.body;
    if (!name) return res.status(400).json({ error: "Tên drone bắt buộc" });

    const newDrone = await DroneDelivery.create({
      name,
      speed: speed || 0,
      orderId: null,
      status: "WAITING",
      estimatedTime: null,
      location: null
    });

    res.json({ message: "Tạo mới thành công", data: newDrone });
  } catch (err) {
    console.error("❌ Lỗi create:", err);
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật drone
export const update = async (req, res) => {
  try {
    // ✅ req.body chứa các trường cần cập nhật, ví dụ: { "speed": 150 }
    const [updatedRows] = await DroneDelivery.update(req.body, { where: { id: req.params.id } });
    if (updatedRows === 0) return res.status(404).json({ error: "Drone không tồn tại" });
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ Lỗi update:", err);
    res.status(500).json({ error: err.message });
  }
};

// Xóa drone
export const remove = async (req, res) => {
  try {
    const drone = await DroneDelivery.findByPk(req.params.id);
    if (!drone) return res.status(404).json({ error: "Drone không tồn tại" });

    if (["FLYING", "RETURNING", "DELIVERED"].includes(drone.status)) {
      return res.status(400).json({ error: `Không thể xóa drone đang ${drone.status}` });
    }

    await DroneDelivery.destroy({ where: { id: req.params.id } });
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    console.error("❌ Lỗi remove:", err);
    res.status(500).json({ error: err.message });
  }
};
