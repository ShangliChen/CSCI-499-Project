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

    // Student-specific fields
    dob: { type: Date, default: null },
    phoneNumber: { type: String, default: null },
    profilePicture: { type: String, default: null },
    bio: { type: String, default: "" },
    address: { type: String, default: "" },

    // Assessment fields
    assessment_date: { type: Date, default: null },
    assessment_score: { type: String, default: null },

    // Counselor-specific fields
    license: { type: String, default: null },
    idPicture: { type: String, default: null },
    licensePicture: { type: String, default: null },
  },
  { timestamps: true }
);

//
// 🔐 Password hashing before saving
//
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//
// 🔐 Compare entered password with hashed one
//
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);

export default User;
