import mongoose from "mongoose";

const AvailabilitySchema = new mongoose.Schema({
  counselor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // "2025-01-15"
  timeSlots: [{ type: String, required: true }]
});

export default mongoose.models.CounselorAvailability ||
  mongoose.model("CounselorAvailability", AvailabilitySchema);
