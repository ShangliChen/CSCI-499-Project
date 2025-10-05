import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";

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
app.use('/uploads', express.static(path.join(path.resolve(), '/uploads'))); // Serve uploaded files


// ✅ Root route (to avoid 404 on http://localhost:5000/)
app.get("/", (req, res) => {
  res.send("🚀 Server is running on port 5000");
});

import User from './models/User.js'; // <-- Import the User model

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// --- AUTH ROUTES ---

// Generic Signup
app.post("/signup/:userType", async (req, res) => {
  console.log(`Received signup request for type: ${req.params.userType}`);
  console.log("Request body:", req.body);
  const { userType } = req.params;
  const { name, school_id, email, password, dob, phoneNumber, license } = req.body;

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
      name,
      school_id,
      email,
      password,
      role: userType,
      dob: userType === 'student' ? dob : null,
      phoneNumber: userType === 'student' ? phoneNumber : null,
      license: userType === 'counselor' ? license : null,
    });

    await newUser.save();

    res.status(201).json({ success: true, message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} registered successfully`, userId: newUser._id });

  } catch (error) {
    console.error(`❌ ${userType} signup error:`, error);
    res.status(500).json({ success: false, message: "Server error during signup" });
  }
});

// Counselor Document Upload
app.post("/api/counselor/upload-docs", upload.fields([{ name: 'idPicture', maxCount: 1 }, { name: 'licensePicture', maxCount: 1 }]), async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);

    if (!user || user.role !== 'counselor') {
      return res.status(404).json({ success: false, message: "Counselor not found" });
    }

    if (req.files['idPicture']) {
      user.idPicture = req.files['idPicture'][0].path;
    }

    if (req.files['licensePicture']) {
      user.licensePicture = req.files['licensePicture'][0].path;
    }

    await user.save();

    res.status(200).json({ success: true, message: "Documents uploaded successfully" });

  } catch (error) {
    console.error("❌ Document upload error:", error);
    res.status(500).json({ success: false, message: "Server error during document upload" });
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

        res.json({ success: true, message: "Login successful", role: user.role, userId: user._id });

    } catch (error) {
        console.error(`❌ ${userType} login error:`, error);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
