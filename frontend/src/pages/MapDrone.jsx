import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import axios from "axios";

// Icon cho Drone, Store, Customer
const droneIcon = new L.Icon({
  iconUrl: "/icons/drone.png", // thêm icon drone
  iconSize: [40, 40],
});
const storeIcon = new L.Icon({
  iconUrl: "/icons/store.png",
  iconSize: [40, 40],
});
const customerIcon = new L.Icon({
  iconUrl: "/icons/customer.png",
  iconSize: [40, 40],
});

const MapDrone = ({ storeAddress, customerAddress }) => {
  const [positions, setPositions] = useState({
    drone: { lat: 10.762622, lng: 106.660172 }, // mặc định vị trí A
    store: null,
    customer: null,
  });

  // Geocoding địa chỉ sang tọa độ
  const geocode = async (address) => {
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: address, format: "json", limit: 1 },
      });
      if (res.data.length > 0) {
        return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
      }
      return null;
    } catch (err) {
      console.error("Lỗi geocoding:", err);
      return null;
    }
  };

  useEffect(() => {
    const fetchPositions = async () => {
      const storePos = await geocode(storeAddress);
      const customerPos = await geocode(customerAddress);
      setPositions((prev) => ({ ...prev, store: storePos, customer: customerPos }));
    };
    fetchPositions();
  }, [storeAddress, customerAddress]);

  if (!positions.store || !positions.customer) return <div>Đang tải bản đồ...</div>;

  return (
    <MapContainer center={positions.drone} zoom={13} style={{ width: "100%", height: "500px" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Marker */}
      <Marker position={positions.drone} icon={droneIcon} />
      <Marker position={positions.store} icon={storeIcon} />
      <Marker position={positions.customer} icon={customerIcon} />

      {/* Đường đi */}
      <Polyline
        positions={[positions.drone, positions.store, positions.customer]}
        color="blue"
        weight={3}
        dashArray="5,10"
      />
    </MapContainer>
  );
};

export default MapDrone;
