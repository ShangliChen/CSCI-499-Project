import mongoose from "mongoose";

const StudentNoteSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    counselor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const StudentNote = mongoose.models.StudentNote || mongoose.model("StudentNote", StudentNoteSchema);
export default StudentNote;

