// src/controllers/admin.teacher.controller.js
import asyncHandler from "express-async-handler";
import Teacher from "../models/teacher.model.js";

/**
 * @desc    Create a teacher (admin only)
 * @route   POST /api/admin/teachers
 * @access  Private (admin)
 * body: { teacherId, name, email?, password, classes?: [], schedule?: {} }
 */
export const createTeacher = asyncHandler(async (req, res) => {
  const { teacherId, name, email, password, classes, schedule } = req.body;

  // basic validation
  if (!teacherId || !name || !password) {
    res.status(400);
    throw new Error("teacherId, name and password are required");
  }

  // check uniqueness
  const existing = await Teacher.findOne({
    $or: [{ teacherId }, { email: email || null }],
  });

  if (existing) {
    res.status(409);
    throw new Error("Teacher with same teacherId or email already exists");
  }

  const newTeacher = new Teacher({
    teacherId,
    name,
    email,
    password, // will be hashed in pre-save
    classes: classes || [],
    schedule: schedule || {},
  });

  const saved = await newTeacher.save();

  // return safe teacher data (no password)
  res.status(201).json({
    id: saved._id,
    teacherId: saved.teacherId,
    name: saved.name,
    email: saved.email,
    classes: saved.classes,
    schedule: saved.schedule,
    createdAt: saved.createdAt,
  });
});
