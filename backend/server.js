import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => console.error("❌ MongoDB connection error:", err));
// --------------------------

app.use(cors()); // allow React frontend
app.use(express.json()); // parse JSON bodies


// ✅ Root route (to avoid 404 on http://localhost:5000/)
app.get("/", (req, res) => {
  res.send("🚀 Server is running on port 5000");
});

import User from './models/User.js'; // <-- Import the User model


// ... (keep existing code until the routes)

// --- AUTH ROUTES ---

// Generic Signup
app.post("/signup/:userType", async (req, res) => {
  const { userType } = req.params;
  const { school_id, email, password, license, photo_id } = req.body;

  if (!['student', 'counselor'].includes(userType)) {
    return res.status(400).json({ success: false, message: "Invalid user type" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { school_id }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email or school ID already exists" });
    }

    // Create new user
    const newUser = new User({
      school_id,
      email,
      password,
      role: userType,
      license: userType === 'counselor' ? license : null,
      photo_id: userType === 'counselor' ? photo_id : null,
    });

    await newUser.save();

    res.status(201).json({ success: true, message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} registered successfully` });

  } catch (error) {
    console.error(`❌ ${userType} signup error:`, error);
    res.status(500).json({ success: false, message: "Server error during signup" });
  }
});

// Generic Login
app.post("/login/:userType", async (req, res) => {
    const { userType } = req.params;
    const { school_id, password } = req.body;

    if (!['student', 'counselor'].includes(userType)) {
        return res.status(400).json({ success: false, message: "Invalid user type" });
    }

    try {
        // Find user by school_id and role
        const user = await User.findOne({ school_id, role: userType });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        res.json({ success: true, message: "Login successful", role: user.role });

    } catch (error) {
        console.error(`❌ ${userType} login error:`, error);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
