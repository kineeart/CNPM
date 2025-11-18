// src/controllers/droneDeliveryController.js
import DroneDelivery from "../models/DroneDelivery.js";

// Lấy danh sách
const getAll = async (req, res) => {
  try {
    const data = await DroneDelivery.findAll();
    res.json({ message: "Danh sách Drone Delivery", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo mới
const create = async (req, res) => {
  try {
    const newRecord = await DroneDelivery.create(req.body);
    res.json({ message: "Tạo mới thành công", data: newRecord });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy theo ID
const getById = async (req, res) => {
  try {
    const rec = await DroneDelivery.findByPk(req.params.id);
    res.json(rec);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật
const update = async (req, res) => {
  try {
    await DroneDelivery.update(req.body, { where: { id: req.params.id } });
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa
const remove = async (req, res) => {
  try {
    await DroneDelivery.destroy({ where: { id: req.params.id } });
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👉 Export dạng default để import không lỗi
export default {
  getAll,
  create,
  getById,
  update,
  remove,
};
export const getWaitingDrones = async (req, res) => {
  try {
    const drones = await DroneDelivery.findAll({
      where: { status: "WAITING" }
    });
    res.json(drones);
  } catch (err) {
    console.error("❌ Lỗi lấy drone:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const assignDrone = async (req, res) => {
  try {
    const { orderId, droneId, estimatedTime, location } = req.body;

    if (!orderId || !droneId) {
      return res.status(400).json({ error: "orderId và droneId bắt buộc" });
    }

    // Update drone có droneId và status = WAITING
    const [updatedRows] = await DroneDelivery.update(
      {
        orderId,
        status: "FLYING",
        estimatedTime: estimatedTime || null,
        location: location || null,
      },
      {
        where: { droneId, status: "WAITING" },
      }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ error: "Drone không tồn tại hoặc không còn WAITING" });
    }

    res.json({ message: "✅ Drone đã được gán cho đơn hàng!" });
  } catch (err) {
    console.error("❌ Lỗi assign drone:", err);
    res.status(500).json({ error: "Server error" });
  }
};

