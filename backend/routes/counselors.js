import express from "express";
import User from "../models/User.js"; 

const router = express.Router();

// GET /api/counselors
router.get("/", async (req, res) => {
  try {
    const counselors = await User.find({ role: "counselor" });

    const data = counselors.map(c => ({
      _id: c._id,
      name: c.name,
      email: c.email,
      license: c.license,
      specialization: c.specialization,
      sessionType: c.sessionType,
      targetStudent: c.targetStudent,
      availability: c.availability || [], // optional if you want availability too
    }));

    res.json({ success: true, counselors: data });
  } catch (err) {
    console.error("Error fetching counselors:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
