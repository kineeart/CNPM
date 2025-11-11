export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(">>> Auth Header:", authHeader); // debug
  if (!authHeader) return res.status(401).json({ message: "Không có token" });

  const token = authHeader.split(" ")[1];
  console.log(">>> Token (backend nhận):", token); // debug

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "JWT_SECRET");
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};
