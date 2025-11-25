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
    const { ownerId, name, description, address, ward, district, province, phone, email, isActive, latitude, longitude } = req.body;

    // Nếu chưa có latitude/longitude, geocode từ địa chỉ
    let lat = latitude ?? null;
    let lng = longitude ?? null;

    if ((!lat || !lng) && address && ward && district && province) {
      const fullAddress = [address, ward, district, province].filter(Boolean).join(", ");
      try {
        const geo = await axios.get("https://nominatim.openstreetmap.org/search", {
          params: { q: fullAddress, format: "json", limit: 1 }
        });
        if (geo.data.length > 0) {
          lat = parseFloat(geo.data[0].lat);
          lng = parseFloat(geo.data[0].lon);
        }
      } catch (err) {
        console.error("❌ Lỗi geocode:", err.message);
      }
    }

    const store = await Store.create({
      ownerId, name, description, address, ward, district, province, phone, email, isActive,
      latitude: lat,
      longitude: lng
    });

    res.status(201).json(store);
  } catch (err) {
    console.error("❌ Lỗi createStore:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerId, name, description, address, ward, district, province, phone, email, isActive, latitude, longitude } = req.body;

    const store = await Store.findByPk(id);
    if (!store) return res.status(404).json({ message: "Không tìm thấy cửa hàng" });

    let lat = latitude ?? store.latitude;
    let lng = longitude ?? store.longitude;

    // Nếu chưa có latitude/longitude, geocode từ địa chỉ
    if ((!lat || !lng) && address && ward && district && province) {
      const fullAddress = [address, ward, district, province].filter(Boolean).join(", ");
      try {
        const geo = await axios.get("https://nominatim.openstreetmap.org/search", {
          params: { q: fullAddress, format: "json", limit: 1 }
        });
        if (geo.data.length > 0) {
          lat = parseFloat(geo.data[0].lat);
          lng = parseFloat(geo.data[0].lon);
        }
      } catch (err) {
        console.error("❌ Lỗi geocode:", err.message);
      }
    }

    await store.update({
      ownerId, name, description, address, ward, district, province, phone, email, isActive,
      latitude: lat,
      longitude: lng
    });

    res.status(200).json(store);
  } catch (err) {
    console.error("❌ Lỗi updateStore:", err);
    res.status(500).json({ message: "Lỗi server" });
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
