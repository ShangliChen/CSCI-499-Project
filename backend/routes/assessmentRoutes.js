import express from "express";
import AssessmentResult from "../models/assessmentResult.js";
// Fix case-sensitive import to match actual filename
import User from "../models/User.js";
import Notification from "../models/notification.js";

const router = express.Router();

// POST: Save assessment result
router.post("/save", async (req, res) => {
  try {
    const {
      userId,
      anxiety_assessment,
      depression_assessment,
      stress_assessment,
      wellbeing_assessment,
      overall_result,
      overall_status,
    } = req.body;

    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    const newAssessment = new AssessmentResult({
      user: userId,  // ✅ Correct field name
      anxiety_assessment,
      depression_assessment,
      stress_assessment,
      wellbeing_assessment,
      overall_result,
      overall_status,
      date_taken: new Date(),
    });

    await newAssessment.save();

    // ✅ Update user record
    await User.findByIdAndUpdate(userId, {
      assessment_date: new Date(),
      assessment_score: overall_result.toString(),
      $push: { assessments: newAssessment._id },
    });
      
    // 🔔 Create notification if result is severe
    const user = await User.findById(userId);
    if (overall_status === "Severe" && user) {
      await Notification.create({
        student: userId,
        message: `${user.name} received a Severe result on their latest assessment.`,
        date: new Date(),
      });
    }

    res.status(201).json({
      message: "Assessment saved successfully!",
      data: newAssessment,
    });
  } catch (err) {
    console.error("Error saving assessment:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET: Get all assessments for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch assessments and populate user name
    const assessments = await AssessmentResult.find({ user: userId })
      .sort({ date_taken: -1 }) // Newest first
      .populate("user", "name email"); // Adjust fields as needed

    res.status(200).json(assessments);
  } catch (err) {
    console.error("Error fetching assessments:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🔔 3️⃣ Counselor — Get all notifications
//
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("student", "name email school_id")
      .sort({ date: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Get only unread (recent) notifications
router.get("/notifications/recent", async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ date: -1 })
      .limit(5)
      .populate("student", "name email school_id");

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching recent notifications:", error);
    res.status(500).json({ message: "Server error", error });
  }
});





export default router;
