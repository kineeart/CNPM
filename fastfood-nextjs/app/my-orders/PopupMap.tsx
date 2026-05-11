"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, Polyline, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const earthRadius = 6371;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const storeIcon = new L.Icon({
  iconUrl: "/icons/store.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const userIcon = new L.Icon({
  iconUrl: "/icons/user.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const droneIcon = new L.Icon({
  iconUrl: "/icons/drone.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export default function PopupMap({
  storeLat,
  storeLon,
  userLat,
  userLon,
  droneSpeed,
  orderId,
  onClose,
}: {
  storeLat: number;
  storeLon: number;
  userLat: number;
  userLon: number;
  droneSpeed?: number;
  orderId: number;
  onClose: () => void;
}) {
  const [dronePos, setDronePos] = useState<[number, number]>([storeLat, storeLon]);
  const [progress, setProgress] = useState(0);

  const distance = haversineDistance(storeLat, storeLon, userLat, userLon);
  const speed = Number(droneSpeed) > 0 ? Number(droneSpeed) : 30;
  const estMinutes = (distance / speed) * 60;
  const remainingDistance = distance * (1 - progress);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    const poll = async () => {
      try {
        const response = await fetch(`/api/proxy/delivery/progress/${orderId}`, { cache: "no-store" });
        // If endpoint doesn't exist (404), gracefully skip updating drone position
        if (!response.ok) {
          console.warn("Delivery progress endpoint not available");
          return;
        }
        const data = await response.json();
        const { progress: currentProgress, position } = data || {};

        if (position?.lat != null && position?.lon != null) {
          setDronePos([position.lat, position.lon]);
        }
        if (typeof currentProgress === "number") {
          setProgress(currentProgress);
        }
      } catch (error) {
        // Silently handle errors from missing endpoint
        console.debug("Delivery progress update skipped");
      }
    };

    poll();
    timer = setInterval(poll, 1500);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [orderId]);

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        <h3>🚁 Lộ trình Drone</h3>

        <MapContainer center={[storeLat, storeLon]} zoom={14} style={{ height: "350px", width: "100%", borderRadius: 10 }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Marker position={[storeLat, storeLon]} icon={storeIcon}>
            <Popup>Store</Popup>
          </Marker>

          <Marker position={[userLat, userLon]} icon={userIcon}>
            <Popup>Khách hàng</Popup>
          </Marker>

          <Marker position={dronePos} icon={droneIcon}>
            <Popup>Drone đang bay 🚀</Popup>
          </Marker>

          <Polyline
            positions={[
              [storeLat, storeLon],
              [userLat, userLon],
            ]}
            color="blue"
          />
        </MapContainer>

        {progress >= 0.5 ? (
          <div style={{ marginTop: 10 }}>
            <p>📏 Tổng quãng đường: {distance.toFixed(2)} km</p>
            <p>✅ Quãng đường đã đi: {(distance * progress).toFixed(2)} km</p>
            <p>⏱️ Thời gian dự kiến còn lại: {(estMinutes * (1 - progress)).toFixed(1)} phút</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
