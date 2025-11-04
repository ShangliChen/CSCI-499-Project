import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    counselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    endTime: { type: String },
  meetingType: {
    type: String,
    enum: ["video", "in-person", "phone", "flexible"],
    required: true
  },
  note: { type: String },
  // Optional meeting details that counselor can send to student
  meetingLink: { type: String }, // e.g., Zoom/Meet link
  meetingLocation: { type: String }, // e.g., Office room or address
  meetingDetails: { type: String }, // additional instructions
  status: {
    type: String,
    enum: ["confirmed", "canceled", "completed"],
    default: "confirmed",
  },
    
  },
  { timestamps: true }
);

const Booking = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
export default Booking;
