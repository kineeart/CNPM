import { Store } from "../models/store.model.js";
import { User } from "../models/user.model.js";

// ✅ Lấy tất cả cửa hàng
export const getStores = async (req, res) => {
  try {
    const stores = await Store.findAll({
      include: [{ model: User, as: "owner", attributes: ["id", "name", "email"] }],
    });
    res.json(stores);
  } catch (error) {
    console.error("❌ Lỗi getStores:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách cửa hàng" });
  }
};

// ✅ Lấy cửa hàng theo ID
export const getStoreById = async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id, {
      include: [{ model: User, as: "owner", attributes: ["id", "name", "email"] }],
    });
    if (!store) return res.status(404).json({ message: "❌ Cửa hàng không tồn tại" });
    res.json(store);
  } catch (error) {
    console.error("❌ Lỗi getStoreById:", error);
    res.status(500).json({ message: "Lỗi server khi lấy cửa hàng" });
  }
};

// ✅ Tạo mới cửa hàng
export const createStore = async (req, res) => {
  try {
    const { ownerId, name, description, address, phone, email } = req.body;

    if (!ownerId || !name)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc: ownerId, name" });

    const store = await Store.create({
      ownerId,
      name,
      description,
      address,
      phone,
      email,
    });

    res.status(201).json({ message: "✅ Tạo cửa hàng thành công", store });
  } catch (error) {
    console.error("❌ Lỗi createStore:", error);
    res.status(500).json({ message: "Lỗi server khi tạo cửa hàng" });
  }
};

// ✅ Cập nhật thông tin cửa hàng
export const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findByPk(id);
    if (!store) return res.status(404).json({ message: "❌ Cửa hàng không tồn tại" });

    await store.update(req.body);
    res.json({ message: "✅ Cập nhật cửa hàng thành công", store });
  } catch (error) {
    console.error("❌ Lỗi updateStore:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật cửa hàng" });
  }
};

// ✅ Xóa cửa hàng
export const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findByPk(id);
    if (!store) return res.status(404).json({ message: "❌ Cửa hàng không tồn tại" });

    await store.destroy();
    res.json({ message: "🗑️ Đã xóa cửa hàng thành công" });
  } catch (error) {
    console.error("❌ Lỗi deleteStore:", error);
    res.status(500).json({ message: "Lỗi server khi xóa cửa hàng" });
  }
};
