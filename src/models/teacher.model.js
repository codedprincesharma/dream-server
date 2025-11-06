// src/models/Teacher.js
import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, required: true, unique: true }, // e.g. "TCHR001"
  name: { type: String, required: true },
  email: { type: String, required: false, unique: true, sparse: true },
  password: { type: String, required: true },
  classes: [{ type: String }], // list of class names/ids
  schedule: { type: Object, default: {} }, // flexible schedule object
  createdAt: { type: Date, default: Date.now },
});

// hash password before save if modified

const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;
