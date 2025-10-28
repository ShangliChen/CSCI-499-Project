import express from "express";
import Notification from "../models/Notification.js"; // your existing model

const router = express.Router();

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
