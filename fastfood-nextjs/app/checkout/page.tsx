"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

const getCurrentUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function CheckoutPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [form, setForm] = useState({ note: "", deliveryAddress: "", contactPhone: "" });
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const user = getCurrentUser();
  const userId = user?.id;

  const fetchCart = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/proxy/cart/${userId}`, { cache: "no-store" });
      const data = await response.json();
      setCartItems(data.cartitems || []);
      setCartTotal(data.totalPrice || 0);
    } catch (error) {
      console.error("❌ Lỗi fetchCart:", error);
    }
  };

  useEffect(() => {
    if (!userId) {
      router.replace("/");
      return;
    }

    fetchCart();

    const fetchCities = async () => {
      try {
        const response = await fetch("https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json");
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error("❌ Lỗi fetchCities:", error);
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

    const city = cities.find((item) => item.Id === selectedCity);
    if (city) setDistricts(city.Districts);
  }, [selectedCity, cities]);

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard("");
      return;
    }

    const district = districts.find((item) => item.Id === selectedDistrict);
    if (district) setWards(district.Wards);
  }, [selectedDistrict, districts]);

  useEffect(() => {
    if (!selectedCity) return;

    const addressString = [
      wards.find((ward) => ward.Id === selectedWard)?.Name,
      districts.find((district) => district.Id === selectedDistrict)?.Name,
      cities.find((city) => city.Id === selectedCity)?.Name,
    ]
      .filter(Boolean)
      .join(", ");

    const fetchCoords = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressString)}&format=json&limit=1`
        );
        const data = await response.json();
        if (data.length > 0) {
          setLatitude(parseFloat(data[0].lat));
          setLongitude(parseFloat(data[0].lon));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchCoords();
  }, [selectedCity, selectedDistrict, selectedWard, wards, districts, cities]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleCheckout = async () => {
    if (!userId || cartItems.length === 0) return;

    if (!selectedCity || !selectedDistrict || !selectedWard) {
      const errorMsg = "❌ Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã";
      setMessage(errorMsg);
      alert(errorMsg);
      return;
    }

    if (!form.contactPhone || form.contactPhone.trim() === "") {
      const errorMsg = "❌ Vui lòng nhập số điện thoại liên hệ";
      setMessage(errorMsg);
      alert(errorMsg);
      return;
    }

    if (!latitude || !longitude) {
      const errorMsg = "❌ Vui lòng chọn vị trí giao hàng trên bản đồ";
      setMessage(errorMsg);
      alert(errorMsg);
      return;
    }

    setLoading(true);
    setMessage("");

    const deliveryAddress = [
      cities.find((city) => city.Id === selectedCity)?.Name,
      districts.find((district) => district.Id === selectedDistrict)?.Name,
      wards.find((ward) => ward.Id === selectedWard)?.Name,
    ]
      .filter(Boolean)
      .join(", ");

    try {
      const response = await fetch("/api/proxy/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          cartId: cartItems[0]?.cartId,
          note: form.note,
          deliveryAddress,
          contactPhone: form.contactPhone,
          latitude,
          longitude,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Lỗi khi tạo đơn");
      }

      const orderId = data.orderId;
      router.push(`/zalopay-test?orderId=${orderId}`);
    } catch (error) {
      console.error("❌ Lỗi khi tạo đơn:", error);
      setMessage("❌ Lỗi khi tạo đơn, thử lại sau.");
    }

    setLoading(false);
  };

  return (
    <div className="checkout-container">
      <span className="csr-note">CSR</span>
      <p className="csr-description">Browser fetch → Next API route → backend checkout / order creation</p>

      <h2>🛒 Thanh toán</h2>

      <div className="checkout-content">
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

              {cartItems.map((item) => {
                const productName = item.productName || item.Product?.name || item.product?.name || "Sản phẩm";
                const productPrice = Number(item.productPrice || item.Product?.price || item.product?.price || 0);

                return (
                  <div key={item.id} className="cart-row">
                    <span className="item-name">{productName}</span>
                    <span>{item.quantity}</span>
                    <span>{(item.quantity * productPrice).toLocaleString()} VNĐ</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="checkout-form">
            <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
              <option value="">Chọn tỉnh/thành</option>
              {cities.map((city) => (
                <option key={city.Id} value={city.Id}>
                  {city.Name}
                </option>
              ))}
            </select>

            <select value={selectedDistrict} onChange={(event) => setSelectedDistrict(event.target.value)}>
              <option value="">Chọn quận/huyện</option>
              {districts.map((district) => (
                <option key={district.Id} value={district.Id}>
                  {district.Name}
                </option>
              ))}
            </select>

            <select value={selectedWard} onChange={(event) => setSelectedWard(event.target.value)}>
              <option value="">Chọn phường/xã</option>
              {wards.map((ward) => (
                <option key={ward.Id} value={ward.Id}>
                  {ward.Name}
                </option>
              ))}
            </select>

            <input name="note" placeholder="Ghi chú" value={form.note} onChange={handleChange} />
            <input name="contactPhone" placeholder="Số điện thoại" value={form.contactPhone} onChange={handleChange} />

            <h4>📍 Chọn vị trí trên bản đồ</h4>
            <MapPicker lat={latitude} lon={longitude} setLat={setLatitude} setLon={setLongitude} />

            {latitude && longitude ? (
              <p>
                Tọa độ: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="checkout-right">
          <div className="cart-summary1">
            <h3>Tổng giỏ hàng</h3>
            <p>
              Tổng số lượng: <strong>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</strong>
            </p>
            <p>
              Tổng tiền: <strong>{cartTotal.toLocaleString()} VNĐ</strong>
            </p>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || cartItems.length === 0 || !selectedCity || !selectedDistrict || !selectedWard || !form.contactPhone}
            className="checkout-btn-green"
          >
            {loading ? "Đang xử lý..." : "Thanh toán"}
          </button>

          {message ? <p>{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
