import express from "express";
import User from "../models/User.js";
import StudentNote from "../models/StudentNote.js";

const router = express.Router();

// Create a note (counselor only)
router.post("/", async (req, res) => {
  try {
    const { counselorId, studentId, content } = req.body || {};
    if (!counselorId || !studentId || !content) {
      return res.status(400).json({ success: false, message: "counselorId, studentId and content are required" });
    }
    const counselor = await User.findById(counselorId);
    if (!counselor || counselor.role !== "counselor") {
      return res.status(403).json({ success: false, message: "Only counselors can add notes" });
    }
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const note = await StudentNote.create({ counselor: counselorId, student: studentId, content });
    const populated = await note.populate("counselor", "name email");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error("Create note error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all notes for a student (counselors only)
router.get("/:studentId", async (req, res) => {
  try {
    const { counselorId } = req.query;
    const { studentId } = req.params;
    if (!counselorId) return res.status(400).json({ success: false, message: "counselorId is required" });
    const counselor = await User.findById(counselorId);
    if (!counselor || counselor.role !== "counselor") {
      return res.status(403).json({ success: false, message: "Only counselors can view notes" });
    }

    const notes = await StudentNote.find({ student: studentId })
      .sort({ createdAt: -1 })
      .populate("counselor", "name email");
    res.json({ success: true, data: notes });
  } catch (err) {
    console.error("Fetch notes error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;

