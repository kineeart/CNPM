  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import Navbar from "../components/Navbar";
  import "../css/CustomerOrder.css";

  import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
  import "leaflet/dist/leaflet.css";

  const CustomerOrder = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // state lưu tọa độ từng order
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [storeLat, setStoreLat] = useState(null);
    const [storeLon, setStoreLon] = useState(null);
    const [userLat, setUserLat] = useState(null);
    const [userLon, setUserLon] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    const STATUS_MAP = {
      pending: { label: "Chưa xác nhận", icon: "🕒" },
      confirm: { label: "Xác nhận", icon: "✅" },
      processing: { label: "Đang xử lý", icon: "⚙️" },
      delivering: { label: "Vận chuyển", icon: "🚚" },
      success: { label: "Thành công", icon: "🌟" },
      failed: { label: "Hủy", icon: "❌" },
    };

    // ----------- 1. Lấy danh sách đơn ------------
    useEffect(() => {
      if (!userId) {
        setLoading(false);
        setError("Bạn cần đăng nhập để xem đơn hàng.");
        return;
      }

      const fetchOrders = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/orders/user/${userId}`
          );

          if (Array.isArray(response.data.orders)) {
            setOrders(response.data.orders);
          } else {
            setOrders([]);
          }
        } catch (err) {
          console.error("Error fetching orders:", err);
          setError("Không thể tải đơn hàng.");
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    }, [userId]);

    // ----------- 2. Lấy tọa độ từ Backend ------------
const fetchCoordinates = async (order) => {
  if (!order.store || !order.deliveryAddress) return;

  try {
    const res = await axios.post("http://localhost:3000/api/geocode", {
      storeAddress: `${order.store.address}, ${order.store.ward}, ${order.store.district}, ${order.store.province}`,
      userAddress: order.deliveryAddress
    });

    console.log("Geocode result:", res.data);

    setStoreLat(parseFloat(res.data.storeLat));
    setStoreLon(parseFloat(res.data.storeLon));
    setUserLat(parseFloat(res.data.userLat));
    setUserLon(parseFloat(res.data.userLon));

    setSelectedOrder(order); // ✅ chọn order hiện map

  } catch (err) {
    console.error("Lỗi geocode:", err);
    alert("Không lấy được tọa độ, thử lại sau.");
  }
};



    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;

    return (
      <>
        <Navbar />
        <div className="order-page-wrapper">
          <div className="order-container">
            <h2>🧾 Đơn hàng của bạn</h2>

            {orders.length === 0 ? (
              <div className="no-orders-message">Bạn chưa có đơn hàng nào.</div>
            ) : (
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
                      <td>
                        {new Intl.NumberFormat("vi-VN").format(order.totalPrice)} VNĐ
                      </td>
                      <td>
                        {new Date(order.createAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td>
                        {STATUS_MAP[order.status]?.icon}{" "}
                        {STATUS_MAP[order.status]?.label}
                      </td>
                      <td>
                       <button
  className="map-btn"
  onClick={() => fetchCoordinates(order)}
>
  🗺️ Xem Map
</button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ----------- HIỆN MAP ----------- */}
            {selectedOrder && storeLat && userLat && (
              <div className="map-wrapper">
                <h3>🚚 Đường đi đơn #{selectedOrder.id}</h3>

                <MapContainer
                  center={[storeLat, storeLon]}
                  zoom={13}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  <Marker position={[storeLat, storeLon]}>
                    <Popup>Cửa hàng</Popup>
                  </Marker>

                  <Marker position={[userLat, userLon]}>
                    <Popup>Khách hàng</Popup>
                  </Marker>

                  <Polyline
                    positions={[
                      [storeLat, storeLon],
                      [userLat, userLon],
                    ]}
                    color="red"
                  />
                </MapContainer>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  export default CustomerOrder;
