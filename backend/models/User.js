import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    // Common fields
    name: {
      type: String,
      required: true,
    },
    school_id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "counselor"],
      required: true,
    },
    favorites: [
    {
      title: String,
      category: String,
      url: String,
    }
  ],
    recentGames: [
    {
      title: String,
      category: String,
      url: String,
    }
  ],
    // Student-specific fields
    dob: { type: Date, default: null },
    phoneNumber: { type: String, default: null },
    profilePicture: { type: String, default: null },
    bio: { type: String, default: "" },
    address: { type: String, default: "" },
    // Assessment tracking (legacy single field)
    assessment_date: { type: Date, default: null },
    assessment_score: { type: String, default: null },
    // 🔗 Link to multiple detailed assessments
    assessments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AssessmentResult",
        },
    ],
    

  // Counselor-specific fields
  license: { type: String, default: null },
  idPicture: { type: String, default: null },
  licensePicture: { type: String, default: null },
  // 🔹 New counselor profile details
  specialization: { type: [String], default: [] },
  sessionType: { type: [String], default: [] },
  targetStudent: { type: [String], default: [] },
  capacity: { type: Number, default: 5 },
  


  // Counselor verification status
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved", // Students are approved by default; counselors set to pending at signup
  },
  rejectionReason: { type: String, default: "" },
  // Forum controls
  canPost: { type: Boolean, default: true },
  postRestrictionReason: { type: String, default: "" },
  // Account recovery
  securityQuestion: { type: String, default: null },
  securityAnswerHash: { type: String, default: null },
},
  { timestamps: true }
);

// 🔐 Password hashing before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Compare entered password with hashed one
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Use this pattern to avoid recompiling the model
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
