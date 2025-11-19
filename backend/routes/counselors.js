import express from "express";
import User from "../models/User.js";
import CounselorAvailability from "../models/CounselorAvailability.js";

const router = express.Router();

// GET /api/counselors
// Returns all counselors with merged availability records
router.get("/", async (req, res) => {
  try {
    // Base counselor info
    const counselors = await User.find({ role: "counselor" }).select(
      "name email license specialization sessionType targetStudent profilePicture"
    );

    // All availability records
    const availability = await CounselorAvailability.find().populate(
      "counselor",
      "_id"
    );

    const data = counselors.map((c) => {
      const slotsForCounselor = availability
        .filter(
          (a) =>
            a.counselor &&
            String(a.counselor._id) === String(c._id)
        )
        .map((a) => ({
          date: a.date, // "YYYY-MM-DD"
          timeSlots: Array.isArray(a.timeSlots) ? a.timeSlots : [],
        }));

      return {
        _id: c._id,
        name: c.name,
        email: c.email,
        license: c.license,
        profilePicture: c.profilePicture,
        specialization: c.specialization,
        sessionType: c.sessionType,
        targetStudent: c.targetStudent,
        availability: slotsForCounselor,
      };
    });

    res.json({ success: true, counselors: data });
  } catch (err) {
    console.error("Error fetching counselors:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
