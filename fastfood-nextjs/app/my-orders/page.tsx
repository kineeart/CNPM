"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const PopupMap = dynamic(() => import("./PopupMap"), { ssr: false });

const getCurrentUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

type OrderLike = {
  id: number;
  totalPrice: number;
  createdAt: string;
  status: string;
  latitude: number;
  longitude: number;
  Store?: {
    latitude: number;
    longitude: number;
  };
  Drone?: {
    speed?: number;
  };
};

export default function CustomerOrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderLike[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderLike | null>(null);
  const [storeLat, setStoreLat] = useState<number | null>(null);
  const [storeLon, setStoreLon] = useState<number | null>(null);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = getCurrentUser();
  const userId = user?.id;

  const STATUS_MAP: Record<string, { label: string; icon: string }> = {
    pending: { label: "Chưa xác nhận", icon: "🕒" },
    confirm: { label: "Xác nhận", icon: "✅" },
    processing: { label: "Đang xử lý", icon: "⚙️" },
    delivering: { label: "Vận chuyển", icon: "🚚" },
    success: { label: "Thành công", icon: "🌟" },
    failed: { label: "Hủy", icon: "❌" },
  };

  useEffect(() => {
    if (!userId) {
      router.replace("/");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/proxy/orders/user/${userId}`, { cache: "no-store" });
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const showMap = (order: OrderLike) => {
    if (!order.Store) return;
    setStoreLat(order.Store.latitude);
    setStoreLon(order.Store.longitude);
    setUserLat(order.latitude);
    setUserLon(order.longitude);
    setSelectedOrder(order);
    setShowMapPopup(true);
  };

  const closePopup = () => {
    setShowMapPopup(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return <div className="csr-description">Đang tải...</div>;
  }

  return (
    <div className="order-page-wrapper">
      <div className="order-container">
        <span className="csr-note">CSR</span>
        <p className="csr-description">Browser fetch → Next API route → backend orders + delivery progress</p>
        <h2>🧾 Đơn hàng của bạn</h2>

        <table className="order-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã đơn</th>
              <th>Giá tiền</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Map</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id}>
                <td>{index + 1}</td>
                <td>#{order.id}</td>
                <td>{new Intl.NumberFormat("vi-VN").format(order.totalPrice)} VNĐ</td>
                <td>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                <td>
                  {STATUS_MAP[order.status]?.icon} {STATUS_MAP[order.status]?.label}
                </td>
                <td>
                  {(order.status === "delivering" || order.status === "success") && (
                    <button onClick={() => showMap(order)}>🗺️ Xem Map</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showMapPopup && storeLat != null && storeLon != null && userLat != null && userLon != null && selectedOrder ? (
          <PopupMap
            storeLat={storeLat}
            storeLon={storeLon}
            userLat={userLat}
            userLon={userLon}
            droneSpeed={selectedOrder.Drone?.speed}
            orderId={selectedOrder.id}
            onClose={closePopup}
          />
        ) : null}
      </div>
    </div>
  );
}
