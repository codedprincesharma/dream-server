// src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

/**
 * protect - checks for JWT in:
 *   1) Authorization header: "Bearer <token>"
 *   2) Cookie: token=<token>
 *   3) Query param: ?token=<token>   (not recommended for prod; for testing)
 *
 * On success: attaches req.user = { id, role, email, name? }
 * Throws 401 on missing/invalid token, 500 if server misconfigured.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1) Authorization header
  if (
    req.headers.authorization &&
    typeof req.headers.authorization === "string" &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1].trim();
  }

  // 2) cookie fallback (requires cookie-parser middleware in app)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 3) query fallback (for quick testing only)
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set");
    res.status(500);
    throw new Error("Server misconfiguration");
  }

  try {
    // verify (sync)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // minimal user info — don't attach secrets
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
    };

    return next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    res.status(401);
    throw new Error("Not authorized, token failed or expired");
  }
});

/**
 * adminOnly - ensure req.user exists and has role === "admin"
 * Use after protect middleware: router.post("/", protect, adminOnly, handler)
 */
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Forbidden: admin access required");
  }
  return next();
};
