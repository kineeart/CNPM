// backend/routes/map.routes.js
import express from "express";
import axios from "axios";

const router = express.Router();

// POST /api/map/geocode
router.post("/geocode", async (req, res) => {
  try {
    const { address } = req.body; // address = "123 ABC, Phường X, Quận Y, Hà Nội"

    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: address,
        format: "json",
        limit: 1
      }
    });

    if (response.data.length === 0) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });

    const location = response.data[0]; // Lấy kết quả đầu tiên
    res.json({
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
