import { Address } from "../models/address.model.js";

// Lấy danh sách địa chỉ user
export const getAddresses = async (req, res) => {
  const { userId } = req.params;
  try {
    const addresses = await Address.findAll({ where: { userId } });
    res.json(addresses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi lấy địa chỉ" });
  }
};

// Thêm hoặc update địa chỉ
export const addOrUpdateAddress = async (req, res) => {
  const { userId } = req.params;
  const { name, phone, address, ward, district, province, isDefault } = req.body;
  try {
    if (isDefault) {
      // Reset các địa chỉ khác thành false
      await Address.update({ isDefault: false }, { where: { userId } });
    }

    // Tạo địa chỉ mới
    const newAddress = await Address.create({
      userId,
      name,
      phone,
      address,
      ward,
      district,
      province,
      isDefault: isDefault || false,
    });

    res.status(201).json({ message: "Đã thêm địa chỉ", address: newAddress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi thêm địa chỉ" });
  }
};
