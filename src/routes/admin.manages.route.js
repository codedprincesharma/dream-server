// src/routes/admin.teacher.route.js
import express from "express";
import { createTeacher } from "../controllers/admin.manages.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// admin creates teacher
router.post("/", protect, adminOnly, createTeacher);

// optionally add GET / to list teachers (admin only)
export default router;
