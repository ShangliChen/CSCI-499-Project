import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => console.error("❌ MongoDB connection error:", err));

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(path.resolve(), '/uploads')));

app.get("/", (req, res) => {
  res.send("🚀 Server is running on port 5000");
});

// --- Multer Storage ---
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

    if (req.files['idPicture']) user.idPicture = req.files['idPicture'][0].path;
    if (req.files['licensePicture']) user.licensePicture = req.files['licensePicture'][0].path;

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

    res.json({ 
      success: true, 
      message: "Login successful", 
      role: user.role, 
      userId: user._id,
      name: user.name // 👈 send name to frontend
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

    user.profilePicture = req.file.path;
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




app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
