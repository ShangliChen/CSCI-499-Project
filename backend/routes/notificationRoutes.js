import express from "express";
import Notification from "../models/notification.js"; // match actual filename (lowercase)

const router = express.Router();

// Get notifications for a specific student (used by student UI)
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const notifications = await Notification.find({ student: studentId })
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    console.error("Error fetching student notifications:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Mark a notification as read
router.post("/:notifId/read", async (req, res) => {
  try {
    const { notifId } = req.params;

    const notif = await Notification.findById(notifId);
    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notif.read = true;
    await notif.save();

    res.status(200).json({ message: "Notification marked as read", notif });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
