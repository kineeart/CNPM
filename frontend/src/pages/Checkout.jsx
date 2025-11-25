import React, { useEffect, useState } from "react";
import "../css/Checkout.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

// ================= MAP PICKER =================
const MapPicker = ({ lat, lon, setLat, setLon }) => {
  const defaultPosition = [lat || 10.7769, lon || 106.7009]; // HCM

  const AutoZoom = () => {
    const map = useMap();
    useEffect(() => {
      if (lat && lon) {
        map.setView([lat, lon], 16);
      }
    }, [lat, lon, map]);
    return null;
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setLat(e.latlng.lat);
        setLon(e.latlng.lng);
      },
    });
    return null;
  };

  return (
    <MapContainer center={defaultPosition} zoom={13} style={{ height: "300px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={lat && lon ? [lat, lon] : defaultPosition} />
      <MapClickHandler />
      <AutoZoom />
    </MapContainer>
  );
};

const Checkout = () => {
  const navigate = useNavigate(); // <-- FIXED HERE 💥

  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [form, setForm] = useState({ note: "", deliveryAddress: "", contactPhone: "" });

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // ========== FETCH CART ==========
  const fetchCart = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:3000/api/cart/user/${userId}`);
      setCartItems(res.data.cartitems || []);
      setCartTotal(res.data.totalPrice || 0);
    } catch (err) {
      console.error("❌ Lỗi fetchCart:", err);
    }
  };

  useEffect(() => {
    fetchCart();

    const fetchCities = async () => {
      try {
        const res = await axios.get(
          "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json"
        );
        setCities(res.data);
      } catch (err) {
        console.error("❌ Lỗi fetchCities:", err);
      }
    };
    fetchCities();
  }, [userId]);

  useEffect(() => {
    if (!selectedCity) {
      setDistricts([]);
      setSelectedDistrict("");
      return;
    }
    const city = cities.find((c) => c.Id === selectedCity);
    if (city) setDistricts(city.Districts);
  }, [selectedCity, cities]);

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard("");
      return;
    }
    const district = districts.find((d) => d.Id === selectedDistrict);
    if (district) setWards(district.Wards);
  }, [selectedDistrict, districts]);

  // Lấy tọa độ khi chọn tỉnh / quận / phường
  useEffect(() => {
    if (!selectedCity) return;

    const addressString = [
      wards.find((w) => w.Id === selectedWard)?.Name,
      districts.find((d) => d.Id === selectedDistrict)?.Name,
      cities.find((c) => c.Id === selectedCity)?.Name,
    ]
      .filter(Boolean)
      .join(", ");

    const fetchCoords = async () => {
      try {
        const res = await axios.get("https://nominatim.openstreetmap.org/search", {
          params: { q: addressString, format: "json", limit: 1 },
        });
        if (res.data.length > 0) {
          setLatitude(parseFloat(res.data[0].lat));
          setLongitude(parseFloat(res.data[0].lon));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCoords();
  }, [selectedCity, selectedDistrict, selectedWard, wards, districts, cities]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= CHECKOUT =================
  const handleCheckout = async () => {
    if (!userId || cartItems.length === 0) return;
    setLoading(true);
    setMessage("");

    const deliveryAddress = [
      cities.find((c) => c.Id === selectedCity)?.Name,
      districts.find((d) => d.Id === selectedDistrict)?.Name,
      wards.find((w) => w.Id === selectedWard)?.Name,
    ]
      .filter(Boolean)
      .join(", ");

    try {
      const res = await axios.post("http://localhost:3000/api/orders", {
        userId,
        cartId: cartItems[0]?.cartId,
        note: form.note,
        deliveryAddress,
        contactPhone: form.contactPhone,
        latitude,
        longitude,
      });

      const orderId = res.data.orderId;

      // ================= REDIRECT =================
      navigate(`/zalopay-test?orderId=${orderId}`);
    } catch (err) {
      console.error("❌ Lỗi khi tạo đơn:", err);
      setMessage("❌ Lỗi khi tạo đơn, thử lại sau.");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="checkout-container">
        <h2>🛒 Thanh toán</h2>

        <div className="checkout-content">
          {/* LEFT */}
          <div className="checkout-left">
            {cartItems.length === 0 ? (
              <p>Giỏ hàng trống</p>
            ) : (
              <div className="cart-items">
                <div className="cart-header">
                  <span>Tên</span>
                  <span>SL</span>
                  <span>Tổng</span>
                </div>

                {cartItems.map((item) => (
                  <div key={item.id} className="cart-row">
                    <span className="item-name">{item.productName}</span>
                    <span>{item.quantity}</span>
                    <span>{(item.quantity * item.productPrice).toLocaleString()} VNĐ</span>
                  </div>
                ))}
              </div>
            )}

            <div className="checkout-form">
              {/* Dropdown */}
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                <option value="">Chọn tỉnh/thành</option>
                {cities.map((c) => (
                  <option key={c.Id} value={c.Id}>
                    {c.Name}
                  </option>
                ))}
              </select>

              <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                <option value="">Chọn quận/huyện</option>
                {districts.map((d) => (
                  <option key={d.Id} value={d.Id}>
                    {d.Name}
                  </option>
                ))}
              </select>

              <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)}>
                <option value="">Chọn phường/xã</option>
                {wards.map((w) => (
                  <option key={w.Id} value={w.Id}>
                    {w.Name}
                  </option>
                ))}
              </select>

              <input name="note" placeholder="Ghi chú" value={form.note} onChange={handleChange} />
              <input
                name="contactPhone"
                placeholder="Số điện thoại"
                value={form.contactPhone}
                onChange={handleChange}
              />

              <h4>📍 Chọn vị trí trên bản đồ</h4>
              <MapPicker lat={latitude} lon={longitude} setLat={setLatitude} setLon={setLongitude} />

              {latitude && longitude && (
                <p>
                  Tọa độ: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="checkout-right">
            <div className="cart-summary1">
              <h3>Tổng giỏ hàng</h3>
              <p>
                Tổng số lượng:{" "}
                <strong>{cartItems.reduce((sum, i) => sum + i.quantity, 0)}</strong>
              </p>
              <p>
                Tổng tiền: <strong>{cartTotal.toLocaleString()} VNĐ</strong>
              </p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
              className="checkout-btn-green"
            >
              {loading ? "Đang xử lý..." : "Thanh toán"}
            </button>

            {message && <p>{message}</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
