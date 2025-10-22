import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from './models/User.js';
import assessmentRoutes from "./routes/assessmentRoutes.js";


dotenv.config();

const app = express();
const PORT = 5000;

// Ensure uploads directory exists at runtime (resolved relative to this file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => console.error("❌ MongoDB connection error:", err));

app.use(cors());
app.use(express.json());
// Serve uploaded files statically from the correct path
app.use('/uploads', express.static(uploadsDir));
app.use("/api/assessments", assessmentRoutes);


app.get("/", (req, res) => {
  res.send("🚀 Server is running on port 5000");
});

// --- Multer Storage ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// --- AUTH ROUTES ---

app.post("/signup/:userType", async (req, res) => {
  const { userType } = req.params;
  const { name, school_id, email, password, dob, phoneNumber, license } = req.body;

  if (!['student', 'counselor'].includes(userType)) {
    return res.status(400).json({ success: false, message: "Invalid user type" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { school_id }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email or school ID already exists" });
    }

    const newUser = new User({
      name,
      school_id,
      email,
      password,
      role: userType,
      dob: userType === 'student' ? dob : null,
      phoneNumber: userType === 'student' ? phoneNumber : null,
      license: userType === 'counselor' ? license : null,
      verificationStatus: userType === 'counselor' ? 'pending' : 'approved',
    });

    await newUser.save();
    res.status(201).json({ success: true, message: `${userType} registered successfully`, userId: newUser._id });
  } catch (error) {
    console.error(`❌ ${userType} signup error:`, error);
    res.status(500).json({ success: false, message: "Server error during signup" });
  }
});

app.post("/api/counselor/upload-docs", upload.fields([{ name: 'idPicture', maxCount: 1 }, { name: 'licensePicture', maxCount: 1 }]), async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'counselor') return res.status(404).json({ success: false, message: "Counselor not found" });

    if (req.files['idPicture']) {
      const filename = path.basename(req.files['idPicture'][0].path);
      user.idPicture = `/uploads/${filename}`;
    }
    if (req.files['licensePicture']) {
      const filename = path.basename(req.files['licensePicture'][0].path);
      user.licensePicture = `/uploads/${filename}`;
    }

    // Keep counselor in pending state for admin review
    if (user.role === 'counselor' && user.verificationStatus !== 'approved') {
      user.verificationStatus = 'pending';
      user.rejectionReason = '';
    }

    await user.save();
    res.status(200).json({ success: true, message: "Documents uploaded successfully" });
  } catch (error) {
    console.error("❌ Document upload error:", error);
    res.status(500).json({ success: false, message: "Server error during document upload" });
  }
});

app.post("/login/:userType", async (req, res) => {
  const { userType } = req.params;
  const { school_id, password } = req.body;

  if (!['student', 'counselor'].includes(userType)) {
    return res.status(400).json({ success: false, message: "Invalid user type" });
  }

  try {
    const user = await User.findOne({ school_id, role: userType });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    // Gate counselor access based on verification
    if (userType === 'counselor') {
      if (user.verificationStatus === 'pending') {
        return res.status(403).json({ success: false, status: 'pending', message: 'Your registration is under review. Please wait for admin approval.' });
      }
      if (user.verificationStatus === 'rejected') {
        return res.status(403).json({ success: false, status: 'rejected', message: user.rejectionReason || 'Your registration was rejected.' });
      }
    }

    res.json({
      success: true,
      message: "Login successful",
      role: user.role,
      userId: user._id,
      name: user.name
    });
  } catch (error) {
    console.error(`❌ ${userType} login error:`, error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});


// --- STUDENT PROFILE ROUTES ---

// 1️⃣ Get student profile
app.get("/api/student/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user || user.role !== 'student') {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ success: false, message: "Server error while fetching profile" });
  }
});



// ✅ Get counselor profile
app.get("/api/counselor/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user || user.role !== 'counselor') {
      return res.status(404).json({ success: false, message: "Counselor not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("❌ Error fetching counselor profile:", error);
    res.status(500).json({ success: false, message: "Server error while fetching profile" });
  }
});


// 2️⃣ Update student profile
app.put("/api/student/profile/:id", async (req, res) => {
  try {
    const updates = (({ name, phoneNumber, bio, address, dob }) => ({ name, phoneNumber, bio, address, dob }))(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!user || user.role !== 'student') {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, message: "Profile updated successfully", data: user });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ success: false, message: "Server error while updating profile" });
  }
});

// 3️⃣ Upload profile picture
app.post("/api/student/upload-profile-pic/:id", upload.single("profilePicture"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'student') {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Store a web-accessible path instead of absolute filesystem path
    const filename = path.basename(req.file.path);
    user.profilePicture = `/uploads/${filename}`;
    await user.save();

    res.status(200).json({ success: true, message: "Profile picture uploaded successfully", imagePath: req.file.path });
  } catch (error) {
    console.error("❌ Error uploading profile picture:", error);
    res.status(500).json({ success: false, message: "Server error while uploading profile picture" });
  }
});

// ✅ GET all students with assessment info
app.get("/api/users/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "name school_id assessment_date assessment_score"
    );
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Error fetching students" });
  }
});

// --- Admin Middleware and Routes ---
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'CSCI-499-Admin';
const adminAuth = (req, res, next) => {
  const secret = req.header('x-admin-secret');
  if (secret !== ADMIN_SECRET) return res.status(401).json({ success: false, message: 'Unauthorized' });
  next();
};

// List all counselors (optionally filter by status via query)
app.get('/api/admin/counselors', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { role: 'counselor' };
    if (status) query.verificationStatus = status;
    const counselors = await User.find(query)
      .select('name email school_id license idPicture licensePicture verificationStatus rejectionReason createdAt');
    res.json({ success: true, data: counselors });
  } catch (err) {
    console.error('Admin list counselors error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get counselor details
app.get('/api/admin/counselors/:id', adminAuth, async (req, res) => {
  try {
    const counselor = await User.findById(req.params.id).select('-password');
    if (!counselor || counselor.role !== 'counselor') {
      return res.status(404).json({ success: false, message: 'Counselor not found' });
    }
    res.json({ success: true, data: counselor });
  } catch (err) {
    console.error('Admin get counselor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve counselor
app.post('/api/admin/counselors/:id/approve', adminAuth, async (req, res) => {
  try {
    const counselor = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'approved', rejectionReason: '' },
      { new: true }
    ).select('-password');
    if (!counselor || counselor.role !== 'counselor') {
      return res.status(404).json({ success: false, message: 'Counselor not found' });
    }
    res.json({ success: true, message: 'Counselor approved', data: counselor });
  } catch (err) {
    console.error('Admin approve counselor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject counselor
app.post('/api/admin/counselors/:id/reject', adminAuth, async (req, res) => {
  try {
    const { reason } = req.body || {};
    const counselor = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'rejected', rejectionReason: reason || '' },
      { new: true }
    ).select('-password');
    if (!counselor || counselor.role !== 'counselor') {
      return res.status(404).json({ success: false, message: 'Counselor not found' });
    }
    res.json({ success: true, message: 'Counselor rejected', data: counselor });
  } catch (err) {
    console.error('Admin reject counselor error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});




app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
