import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../css/Store.css";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = "http://localhost:3000/api/stores";
const API_USER_URL = "http://localhost:3000/api/users"; // để lấy STORE_ADMIN

// ---------- MapPicker ----------
const MapPicker = ({ lat, lon, setLat, setLon }) => {
  const defaultPos = [lat || 10.7769, lon || 106.7009];

  const AutoZoom = () => {
    const map = useMap();
    useEffect(() => {
      if (lat && lon) map.setView([lat, lon], 16);
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
    <MapContainer center={defaultPos} zoom={13} style={{ height: "250px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={lat && lon ? [lat, lon] : defaultPos} />
      <MapClickHandler />
      <AutoZoom />
    </MapContainer>
  );
};

// ---------- Store Component ----------
const Store = () => {
  const [stores, setStores] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editStore, setEditStore] = useState(null);

  // Location state
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [formData, setFormData] = useState({
    ownerId: "",
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    isActive: true,
  });

  // ---------- Fetch Stores ----------
  const fetchStores = async () => {
    try {
      const res = await axios.get(API_URL);
      setStores(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Lỗi fetchStores:", err);
    }
  };

  // ---------- Fetch Admins ----------
  const fetchAdmins = async () => {
    try {
      const res = await axios.get(API_USER_URL);
      const storeAdmins = res.data.filter((u) => u.role === "STORE_ADMIN");
      setAdmins(storeAdmins);
    } catch (err) {
      console.error("❌ Lỗi fetchAdmins:", err);
    }
  };

  // ---------- Fetch Cities ----------
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

  useEffect(() => {
    fetchStores();
    fetchAdmins();
    fetchCities();
  }, []);

  // Update districts when city changes
  useEffect(() => {
    if (!selectedCity) {
      setDistricts([]);
      setSelectedDistrict("");
      setWards([]);
      setSelectedWard("");
      return;
    }
    const city = cities.find((c) => c.Id === selectedCity);
    setDistricts(city ? city.Districts : []);
    setSelectedDistrict("");
    setWards([]);
    setSelectedWard("");
  }, [selectedCity, cities]);

  // Update wards when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard("");
      return;
    }
    const district = districts.find((d) => d.Id === selectedDistrict);
    setWards(district ? district.Wards : []);
    setSelectedWard("");
  }, [selectedDistrict, districts]);

  // Auto fetch coordinates from OpenStreetMap Nominatim
  useEffect(() => {
    if (!selectedCity) return;

    const cityName = cities.find((c) => c.Id === selectedCity)?.Name;
    const districtName = districts.find((d) => d.Id === selectedDistrict)?.Name;
    const wardName = wards.find((w) => w.Id === selectedWard)?.Name;

    const addressString = [wardName, districtName, cityName].filter(Boolean).join(", ");

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

    if (addressString) fetchCoords();
  }, [selectedCity, selectedDistrict, selectedWard, cities, districts, wards]);

  // ---------- Handle Form Change ----------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ---------- Handle Submit ----------
  const handleSubmit = async () => {
    if (!formData.ownerId || !formData.name || !latitude || !longitude) {
      alert("❌ Vui lòng chọn owner, nhập tên và chọn tọa độ");
      return;
    }

    const data = {
      ...formData,
      province: cities.find((c) => c.Id === selectedCity)?.Name || "",
      district: districts.find((d) => d.Id === selectedDistrict)?.Name || "",
      ward: wards.find((w) => w.Id === selectedWard)?.Name || "",
      latitude,
      longitude,
    };

    try {
      if (editStore) {
        await axios.put(`${API_URL}/${editStore.id}`, data);
      } else {
        await axios.post(API_URL, data);
      }
      setShowForm(false);
      setEditStore(null);
      resetForm();
      fetchStores();
    } catch (err) {
      console.error("❌ Lỗi submit store:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      ownerId: "",
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      isActive: true,
    });
    setSelectedCity("");
    setSelectedDistrict("");
    setSelectedWard("");
    setLatitude(null);
    setLongitude(null);
  };

  // ---------- Open Edit ----------
  const openEdit = (store) => {
    setEditStore(store);
    setFormData({
      ownerId: store.ownerId,
      name: store.name,
      description: store.description || "",
      address: store.address || "",
      phone: store.phone || "",
      email: store.email || "",
      isActive: store.isActive,
    });

    const city = cities.find((c) => c.Name === store.province);
    const district = city?.Districts.find((d) => d.Name === store.district);
    const ward = district?.Wards.find((w) => w.Name === store.ward);

    setSelectedCity(city?.Id || "");
    setSelectedDistrict(district?.Id || "");
    setSelectedWard(ward?.Id || "");

    setLatitude(store.latitude ?? null);
    setLongitude(store.longitude ?? null);
    setShowForm(true);
  };

  // ---------- Open Add ----------
  const openAdd = () => {
    setEditStore(null);
    resetForm();
    setShowForm(true);
  };

  // ---------- Delete Store ----------
  const deleteStore = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa cửa hàng này?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setStores(stores.filter((s) => s.id !== id));
    } catch (err) {
      console.error("❌ Lỗi deleteStore:", err);
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="store-container">
      <Sidebar />
      <div className="store-content">
        <h1>Danh sách cửa hàng</h1>
        <button onClick={openAdd}>➕ Thêm cửa hàng</button>

        {showForm && (
          <div className="form-box">
            <h3>{editStore ? "Chỉnh sửa cửa hàng" : "Thêm cửa hàng"}</h3>

            <select name="ownerId" value={formData.ownerId} onChange={handleChange}>
              <option value="">-- Chọn STORE_ADMIN --</option>
              {admins.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.email})
                </option>
              ))}
            </select>

            <input
              type="text"
              name="name"
              placeholder="Tên cửa hàng"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type="text"
              name="description"
              placeholder="Mô tả"
              value={formData.description}
              onChange={handleChange}
            />
            <input
              type="text"
              name="address"
              placeholder="Địa chỉ chi tiết"
              value={formData.address}
              onChange={handleChange}
            />

            {/* Province / District / Ward selects */}
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
              <option value="">-- Chọn Tỉnh/TP --</option>
              {cities.map((c) => (
                <option key={c.Id} value={c.Id}>{c.Name}</option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedCity}
            >
              <option value="">-- Chọn Quận/Huyện --</option>
              {districts.map((d) => (
                <option key={d.Id} value={d.Id}>{d.Name}</option>
              ))}
            </select>

            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              disabled={!selectedDistrict}
            >
              <option value="">-- Chọn Phường/Xã --</option>
              {wards.map((w) => (
                <option key={w.Id} value={w.Id}>{w.Name}</option>
              ))}
            </select>

            <input
              type="text"
              name="phone"
              placeholder="Số điện thoại"
              value={formData.phone}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email cửa hàng"
              value={formData.email}
              onChange={handleChange}
            />
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />{" "}
              Đang hoạt động
            </label>

            <h4>📍 Chọn vị trí cửa hàng trên bản đồ</h4>
            <MapPicker lat={latitude} lon={longitude} setLat={setLatitude} setLon={setLongitude} />
            {latitude && longitude && (
              <p>Tọa độ đã chọn: {latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
            )}

            <button onClick={handleSubmit}>💾 Lưu</button>
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Owner</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Địa chỉ</th>
              <th>Ward</th>
              <th>District</th>
              <th>Province</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Active</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id}>
                <td>{store.id}</td>
                <td>{store.owner?.name || "-"}</td>
                <td>{store.name}</td>
                <td>{store.description}</td>
                <td>{store.address}</td>
                <td>{store.ward}</td>
                <td>{store.district}</td>
                <td>{store.province}</td>
                <td>{store.phone}</td>
                <td>{store.email}</td>
                <td>{store.isActive ? "✅" : "❌"}</td>
                <td>
                  <button onClick={() => openEdit(store)}>✏️</button>
                  <button onClick={() => deleteStore(store.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Store;
