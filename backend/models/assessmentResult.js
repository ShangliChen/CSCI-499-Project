import mongoose from "mongoose";

const AssessmentResultSchema = new mongoose.Schema(
  {
    // 🔗 Link to the user who took the assessment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🧠 Individual assessment scores
    anxiety_assessment: {
      type: Number,
      required: true,
    },
    depression_assessment: {
      type: Number,
      required: true,
    },
    stress_assessment: {
      type: Number,
      required: true,
    },
    wellbeing_assessment: {
      type: Number,
      required: true,
    },

    // 📊 Overall numeric result
    overall_result: {
      type: Number,
      required: true,
    },

    // 🟢 Overall status (e.g. "Good", "Moderate", "Severe")
    overall_status: {
      type: String,
      enum: ["Good", "Moderate", "Severe"],
      required: true,
    },

    // 🗓️ Date when the assessment was taken
    date_taken: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Use this pattern to avoid recompiling the model
const AssessmentResult =
  mongoose.models.AssessmentResult || mongoose.model("AssessmentResult", AssessmentResultSchema);

export default AssessmentResult;
