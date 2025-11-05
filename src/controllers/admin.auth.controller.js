// controllers/admin.auth.controller.js
import adminModel from "../models/admin.auth.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function adminRegisterController(req, res) {
  try {
    const { name, email, password } = req.body ?? {};

    // basic presence validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    // normalize email
    const normalizedEmail = String(email).trim().toLowerCase();

    // check existing user
    const existingUser = await adminModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // hash password (12 rounds is a good default for production)
    const hashPass = await bcrypt.hash(password, 12);

    const admin = await adminModel.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashPass,
    });

    // create JWT
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const token = jwt.sign(
      { id: admin._id.toString(), name: admin.name, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // cookie options: secure/sameSite only enforced in production
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    };

    res.cookie("token", token, cookieOptions);

    // return sanitized admin info (do not return password)
    return res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    // handle duplicate-key race conditions (just in case)
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }

    console.error("adminRegisterController error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
/**
 * POST /auth/login
 * Body: { email, password }
 */
export async function adminLoginController(req, res) {
  try {
    const { email, password } = req.body ?? {};

    // Basic presence validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Find admin by email
    const admin = await adminModel.findOne({ email: normalizedEmail }).lean();
    if (!admin) {
      // do not reveal whether email exists
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    // Payload - keep it small
    const payload = { id: admin._id.toString(), name: admin.name, email: admin.email };

    // Create access token (short lived)
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Cookie options
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd, // only send over HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: isProd ? "None" : "Lax",
      path: "/",
    };

    // Set cookie
    res.cookie("token", token, cookieOptions);

    // Return sanitized admin (never return password)
    return res.status(200).json({
      message: "Logged in successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        createdAt: admin.createdAt ?? undefined,
      },
    });
  } catch (err) {
    console.error("adminLoginController error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /auth/logout
 * Clears the token cookie
 */
export function adminLogoutController(req, res) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", "", {
    httpOnly: true,
    secure: isProd,
    maxAge: 0,
    sameSite: isProd ? "None" : "Lax",
    path: "/",
  });
  return res.status(200).json({ message: "Logged out" });
}

/**
 * Middleware: Protect routes by verifying JWT in cookie
 * Usage: router.get('/private', authMiddleware, handler)
 */

