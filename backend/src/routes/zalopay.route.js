import express from "express";
import axios from "axios";
import crypto from "crypto";

const router = express.Router();

// ✅ Thông tin ZaloPay sandbox
const appid = "YOUR_APPID"; // đổi thành appid của bạn
const key1 = "YOUR_KEY1";   // đổi thành key1 của bạn
const createOrderUrl = "https://sandbox.zalopay.com.vn/v001/tpe/createorder";

router.post("/create", async (req, res) => {
  try {
    const { userId, totalAmount, items } = req.body;

    if (!userId || !totalAmount || !items || !items.length) {
      return res.status(400).json({ error: "Thiếu thông tin đơn hàng" });
    }

    // appuser
    const appuser = "user" + userId;

    // apptime: timestamp millisecond hiện tại
    const apptime = Date.now();

    // apptransid: yyMMdd_random
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const randomNum = Math.floor(Math.random() * 10000);
    const apptransid = `${yy}${mm}${dd}_${randomNum}`;

    // embeddata (có thể thêm redirecturl nếu muốn)
    const embeddata = JSON.stringify({
      merchantinfo: "data từ app",
      redirecturl: "https://yourfrontend.com/checkout/result" // thay đổi nếu cần
    });

    // items: JSON string theo định dạng ZaloPay
    const item = JSON.stringify(
      items.map((i) => ({
        itemid: i.itemid,
        itemname: i.itemname,
        itemprice: i.itemprice,
        itemquantity: i.itemquantity,
      }))
    );

    // tạo mac theo công thức: appid|apptransid|appuser|amount|apptime|embeddata|item
    const macData = `${appid}|${apptransid}|${appuser}|${totalAmount}|${apptime}|${embeddata}|${item}`;
    const mac = crypto.createHmac("sha256", key1).update(macData).digest("hex");

    // 🛠 Debug: log payload gửi lên ZaloPay
    console.log("🚀 Payload ZaloPay:", {
      appid,
      appuser,
      apptime,
      apptransid,
      totalAmount,
      embeddata,
      item,
      mac,
    });

    // params gửi ZaloPay
    const params = new URLSearchParams();
    params.append("appid", appid);
    params.append("appuser", appuser);
    params.append("apptime", apptime);
    params.append("amount", totalAmount);
    params.append("apptransid", apptransid);
    params.append("embeddata", embeddata);
    params.append("item", item);
    params.append("description", `Thanh toán đơn hàng #${apptransid}`);
    params.append("bankcode", "zalopayapp"); // Mobile Web -> App bắt buộc
    params.append("mac", mac);

    // gửi request lên ZaloPay
    const response = await axios.post(createOrderUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    console.log("💡 ZaloPay API response:", response.data);

    // trả về frontend
    res.json(response.data);
  } catch (err) {
    console.error("❌ Lỗi tạo đơn ZaloPay:", err.response?.data || err.message);
    res.status(500).json({ error: "Lỗi tạo đơn ZaloPay" });
  }
});

export default router;
