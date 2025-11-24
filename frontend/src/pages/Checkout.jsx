import React, { useEffect, useState } from "react";
import "../css/Checkout.css";
import Navbar from "../components/Navbar";
import axios from "axios";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [form, setForm] = useState({
    note: "",
    deliveryAddress: "", // địa chỉ chi tiết
    contactPhone: "",
  });
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // fetch cart
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

  // fetch cities
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

  // khi chọn city → set districts
  useEffect(() => {
    if (!selectedCity) {
      setDistricts([]);
      setSelectedDistrict("");
      return;
    }
    const city = cities.find((c) => c.Id === selectedCity);
    if (city) setDistricts(city.Districts);
  }, [selectedCity, cities]);

  // khi chọn district → set wards
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard("");
      return;
    }
    const district = districts.find((d) => d.Id === selectedDistrict);
    if (district) setWards(district.Wards);
  }, [selectedDistrict, districts]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    if (!userId || cartItems.length === 0) return;
    setLoading(true);
    setMessage("");

    // gộp địa chỉ hoàn chỉnh
    const addressString = [
      form.deliveryAddress,
      wards.find((w) => w.Id === selectedWard)?.Name,
      districts.find((d) => d.Id === selectedDistrict)?.Name,
      cities.find((c) => c.Id === selectedCity)?.Name,
    ]
      .filter(Boolean)
      .join(", ");

    try {
      const res = await axios.post("http://localhost:3000/api/orders", {
        userId,
        cartId: cartItems[0]?.cartId,
        note: form.note,
        deliveryAddress: addressString,
        contactPhone: form.contactPhone,
      });

      setMessage(`✅ Tạo đơn thành công, orderId: ${res.data.orderId}`);
      setCartItems([]);
      setCartTotal(0);
      setForm({ note: "", deliveryAddress: "", contactPhone: "" });
      setSelectedCity("");
      setSelectedDistrict("");
      setSelectedWard("");
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
          {/* Cột trái: danh sách sản phẩm */}
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

            {/* Form địa chỉ */}
            <div className="checkout-form">
              <input
                type="text"
                name="deliveryAddress"
                placeholder="Số nhà, tên đường"
                value={form.deliveryAddress}
                onChange={handleChange}
              />

              <select
                className="form-select form-select-sm mb-3"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">Chọn tỉnh/thành</option>
                {cities.map((c) => (
                  <option key={c.Id} value={c.Id}>
                    {c.Name}
                  </option>
                ))}
              </select>

              <select
                className="form-select form-select-sm mb-3"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <option value="">Chọn quận/huyện</option>
                {districts.map((d) => (
                  <option key={d.Id} value={d.Id}>
                    {d.Name}
                  </option>
                ))}
              </select>

              <select
                className="form-select form-select-sm"
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
              >
                <option value="">Chọn phường/xã</option>
                {wards.map((w) => (
                  <option key={w.Id} value={w.Id}>
                    {w.Name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="note"
                placeholder="Ghi chú"
                value={form.note}
                onChange={handleChange}
              />
              <input
                type="text"
                name="contactPhone"
                placeholder="Số điện thoại"
                value={form.contactPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Cột phải */}
          <div className="checkout-right">
            <div className="cart-summary1">
              <h3>Tổng giỏ hàng</h3>
              <p>
                Tổng số lượng: <strong>{cartItems.reduce((s, i) => s + i.quantity, 0)}</strong>
              </p>
              <p>
                Tổng tiền: <strong>{cartTotal.toLocaleString()} VNĐ</strong>
              </p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0 || !userId}
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
