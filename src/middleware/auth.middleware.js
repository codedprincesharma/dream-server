import jwt from "jsonwebtoken"

export function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token || "";

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // attach minimal user info to request
      req.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
      };
      return next();
    });
  } catch (err) {
    console.error("authMiddleware error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}