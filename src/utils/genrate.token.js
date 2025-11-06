// src/utils/generateToken.js
import jwt from "jsonwebtoken";

const token = jwt.sign(
  { id: admin._id, role: admin.role, email: admin.email },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);