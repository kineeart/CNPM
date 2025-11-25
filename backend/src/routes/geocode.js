import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  const { storeAddress, userAddress } = req.body;

  try {
    // Store
    const storeGeo = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: storeAddress, format: "json", limit: 1 },
      headers: { "User-Agent": "MyApp/1.0" },
    });

    // User
    const userGeo = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: userAddress, format: "json", limit: 1 },
      headers: { "User-Agent": "MyApp/1.0" },
    });

    if (!storeGeo.data[0] || !userGeo.data[0]) {
      return res.status(404).json({ error: "Address not found" });
    }

    const storeLat = storeGeo.data[0].lat;
    const storeLon = storeGeo.data[0].lon;
    const userLat = userGeo.data[0].lat;
    const userLon = userGeo.data[0].lon;

    res.json({ storeLat, storeLon, userLat, userLon });
  } catch (err) {
    console.error("Geocode error:", err);
    res.status(500).json({ error: "Geocoding failed" });
  }
});

export default router;
