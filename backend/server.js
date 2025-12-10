import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import User from "./models/User.js";
import Notification from "./models/notification.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import counselorNotesRoutes from "./routes/counselorNotesRoutes.js";
import CounselorAvailability from "./models/CounselorAvailability.js";// new added
import Booking from "./models/Booking.js";
import counselorsRoute from "./routes/counselors.js";
import counselorRequestRoutes from "./routes/counselorRequestRoutes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security questions (served to clients)
const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother’s maiden name?",
  "What was the name of your elementary school?",
  "In what city were you born?",
  "What is your favorite teacher’s name?",
  "What is the title of your favorite book?"
];

const normalizeAnswer = (s = "") => s.trim().toLowerCase();

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

// Enable CORS for all origins and handle preflight
app.use(cors());
app.options("*", cors());
app.use(express.json());
// Serve uploaded files statically from the correct path
app.use('/uploads', express.static(uploadsDir));
app.use("/api/assessments", assessmentRoutes);
app.use("/api/assessments/notifications", notificationRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/counselor/notes", counselorNotesRoutes);
app.use("/api/counselors", counselorsRoute);
app.use('/api/requests', counselorRequestRoutes); // Use the new route for counselor requests
app.use("/api/counselor-requests", counselorRequestRoutes);




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

// --- Public API ---

// Provide available security questions
app.get("/security-questions", (req, res) => {
  res.json({ questions: SECURITY_QUESTIONS });
});

// Signup with security question + answer
app.post("/signup/:userType", async (req, res) => {
  const { userType } = req.params;
  const { name, school_id, email, password, dob, phoneNumber, license, securityQuestion, securityAnswer } = req.body;

  if (!['student', 'counselor'].includes(userType)) {
    return res.status(400).json({ success: false, message: "Invalid user type" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { school_id }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email or school ID already exists" });
    }

    if (!securityQuestion || !securityAnswer) {
      return res.status(400).json({ success: false, message: "Security question and answer are required" });
    }

    // Optional: enforce question is selected from provided list
    if (!SECURITY_QUESTIONS.includes(securityQuestion)) {
      return res.status(400).json({ success: false, message: "Invalid security question" });
    }

    const answerHash = await bcrypt.hash(normalizeAnswer(securityAnswer), 10);

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
      securityQuestion,
      securityAnswerHash: answerHash,
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

// Forgot-password: step 1 — get question
app.post("/forgot-password/init", async (req, res) => {
  try {
    const { school_id } = req.body;
    if (!school_id) return res.status(400).json({ success: false, message: "School ID is required" });
    const user = await User.findOne({ school_id });
    if (!user || !user.securityQuestion) {
      return res.status(404).json({ success: false, message: "User not found or no recovery question set" });
    }
    res.json({ success: true, securityQuestion: user.securityQuestion });
  } catch (error) {
    console.error("❌ Forgot password init error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Forgot-password: step 2 — verify answer and reset password
app.post("/forgot-password/reset", async (req, res) => {
  try {
    const { school_id, answer, newPassword } = req.body;
    if (!school_id || !answer || !newPassword) {
      return res.status(400).json({ success: false, message: "School ID, answer, and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }
    const user = await User.findOne({ school_id });
    if (!user || !user.securityAnswerHash) {
      return res.status(404).json({ success: false, message: "User not found or recovery not set" });
    }
    const ok = await bcrypt.compare(normalizeAnswer(answer), user.securityAnswerHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Incorrect security answer" });
    }
    user.password = newPassword; // will be hashed by pre-save hook
    await user.save();
    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("❌ Forgot password reset error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Logged-in change password (student or counselor)
app.post("/api/users/:id/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.params;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword; // will be hashed by pre-save hook
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Change password error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while changing password" });
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

// ✅ Counselor adds availability
app.post("/api/counselor/availability", async (req, res) => {
  try {
    const { counselorId, date, timeSlots } = req.body;
    const availability = new CounselorAvailability({
      counselor: counselorId,
      date,
      timeSlots,
    });
    await availability.save();
    res.json({ success: true, message: "Availability saved" });
  } catch (err) {
    console.error("❌ Error saving availability:", err);
    res
      .status(500)
      .json({ success: false, message: "Error saving availability" });
  }
});

// ✅ Counselor fetches their own availability (grouped by date)
app.get("/api/counselor/availability/:counselorId", async (req, res) => {
  try {
    const { counselorId } = req.params;
    const records = await CounselorAvailability.find({
      counselor: counselorId,
    }).sort({ date: 1 });

    const byDate = new Map();
    for (const record of records) {
      const key = record.date;
      if (!byDate.has(key)) {
        byDate.set(key, new Set());
      }
      const set = byDate.get(key);
      (record.timeSlots || []).forEach((t) => set.add(t));
    }

    const availability = Array.from(byDate.entries()).map(([date, set]) => ({
      date,
      timeSlots: Array.from(set).sort(),
    }));

    res.json({ success: true, availability });
  } catch (err) {
    console.error("❌ Error fetching counselor availability:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching availability" });
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


// ✅ Update counselor info (specialization, sessionType, targetStudent, basic profile)
app.put("/api/counselor/profile/:id", async (req, res) => {
  try {
    const {
      specialization,
      sessionType,
      targetStudent,
      name,
      email,
      license,
    } = req.body;

    const updates = {};

    // Arrays: allow clearing by sending an empty array, skip if not provided
    if (Array.isArray(specialization)) updates.specialization = specialization;
    if (Array.isArray(sessionType)) updates.sessionType = sessionType;
    if (Array.isArray(targetStudent)) updates.targetStudent = targetStudent;

    // Basic profile fields: update only if provided
    if (typeof name === "string") updates.name = name;
    if (typeof email === "string") updates.email = email.toLowerCase();
    if (typeof license === "string") updates.license = license;

    // Find counselor and update only provided fields
    const updatedCounselor = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select("-password");

    if (!updatedCounselor || updatedCounselor.role !== "counselor") {
      return res
        .status(404)
        .json({ success: false, message: "Counselor not found" });
    }

    res.json({
      success: true,
      message: "Counselor info updated successfully",
      data: updatedCounselor,
    });
  } catch (error) {
    console.error("❌ Error updating counselor info:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while updating counselor info" });
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

    // Return the same web path we store on the user document
    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      imagePath: user.profilePicture,
    });
  } catch (error) {
    console.error("❌ Error uploading profile picture:", error);
    res.status(500).json({ success: false, message: "Server error while uploading profile picture" });
  }
});

// 3️⃣b Upload counselor profile picture
app.post("/api/counselor/upload-profile-pic/:id", upload.single("profilePicture"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "counselor") {
      return res
        .status(404)
        .json({ success: false, message: "Counselor not found" });
    }

    const filename = path.basename(req.file.path);
    user.profilePicture = `/uploads/${filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      imagePath: user.profilePicture,
    });
  } catch (error) {
    console.error("❌ Error uploading counselor profile picture:", error);
    res.status(500).json({
      success: false,
      message: "Server error while uploading profile picture",
    });
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
// save student favorite games
app.post("/api/games/favorites/:userId", async (req, res) => {
  try {
    const { favorites } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { favorites },
      { new: true }
    );

    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    console.error("❌ Error saving favorites:", error);
    res.status(500).json({ success: false, message: "Error saving favorites" });
  }
});
// save student recent play 
app.post("/api/games/recent/:userId", async (req, res) => {
  try {
    const { recentGames } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { recentGames },
      { new: true }
    );

    res.json({ success: true, recentGames: user.recentGames });
  } catch (error) {
    console.error("❌ Error saving recent games:", error);
    res.status(500).json({ success: false, message: "Error saving recent games" });
  }
});

// Load student favorite + recent games
app.get("/api/games/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("favorites recentGames");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      favorites: user.favorites || [],
      recentGames: user.recentGames || []
    });
  } catch (error) {
    console.error("❌ Error loading game data:", error);
    res.status(500).json({ success: false, message: "Error loading game data" });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});


  ///  Create a booking 
  app.post("/api/bookings", async (req, res) => {
    console.log("📌 Booking Request Received:", req.body);

    try {
      const { studentId, counselorId, date, time, meetingType, note } = req.body;

      const booking = new Booking({
        student: studentId,
        counselor: counselorId,
        date,
        time,
        meetingType,
        note,
        status: "confirmed",
      });

      await booking.save();

      // Create a notification for this new booking (student + counselor views)
      try {
        const student = await User.findById(studentId).select("name");
        const message = student
          ? `New counseling session scheduled for ${student.name} on ${date} at ${time}.`
          : `New counseling session scheduled on ${date} at ${time}.`;
        await Notification.create({
          student: studentId,
          message,
        });
      } catch (notifErr) {
        // Don't fail booking if notification creation fails
        console.error("❌ Booking notification creation error:", notifErr);
      }

      res.json({ success: true, message: "Booking saved!", data: booking });

    } catch (error) {
      console.error("❌ Booking creation error:", error);
      res.status(500).json({ success: false, message: "Server error while booking." });
    }
  });


// ✅ Get all bookings for a student (history)
app.get("/api/bookings/student/:studentId", async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.params.studentId })
      .populate("counselor", "name email")
      .sort({ date: 1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error("❌ Fetch all bookings error:", error);
    res.status(500).json({ success: false, message: "Error fetching bookings" });
  }
});

// ✅ Student reschedules an existing booking
app.put("/api/bookings/:id/reschedule", async (req, res) => {
  try {
    const { date, time, meetingType } = req.body || {};

    if (!date || !time) {
      return res
        .status(400)
        .json({ success: false, message: "New date and time are required" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "canceled" || booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Only upcoming confirmed bookings can be rescheduled",
      });
    }

    // Prevent double booking: same counselor, date and time, different booking, not canceled
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      counselor: booking.counselor,
      date,
      time,
      status: { $ne: "canceled" },
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "This time slot is no longer available. Please choose another.",
      });
    }

    booking.date = date;
    booking.time = time;
    if (typeof meetingType === "string" && meetingType.trim()) {
      booking.meetingType = meetingType.trim();
    }

    // When rescheduling, clear any previously sent meeting-specific details
    booking.meetingLink = undefined;
    booking.meetingLocation = undefined;
    booking.meetingDetails = undefined;
    booking.endTime = undefined;

    await booking.save();

    // Create a notification for the counselor about this change
    try {
      const populatedBooking = await booking.populate("student", "name email school_id");
      const student = populatedBooking.student;
      const msg = student
        ? `${student.name} rescheduled their counseling session to ${date} at ${time}.`
        : `A student rescheduled a counseling session to ${date} at ${time}.`;

      await Notification.create({
        student: booking.student,
        message: msg,
      });
    } catch (notifErr) {
      // Do not fail the reschedule if notification creation fails
      console.error("❌ Error creating reschedule notification:", notifErr);
    }

    // Re-populate counselor for frontend convenience (shape similar to list endpoints)
    await booking.populate("counselor", "name email");

    res.json({
      success: true,
      message: "Booking rescheduled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("❌ Reschedule booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rescheduling booking",
    });
  }
});

app.put("/api/bookings/:id/cancel", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "canceled" },
      { new: true }  // ✅ Important: return updated result
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error("❌ Cancel booking error:", error);
    res.status(500).json({ success: false, message: "Server error while canceling booking" });
  }
});

// ✅ Get bookings for a counselor (used by counselor dashboard/views)
app.get("/api/bookings/counselor/:counselorId", async (req, res) => {
  try {
    const { counselorId } = req.params;
    const bookings = await Booking.find({ counselor: counselorId })
      .populate("student", "name email dob")
      .sort({ date: 1, time: 1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error("❌ Fetch counselor bookings error:", error);
    res.status(500).json({ success: false, message: "Error fetching counselor bookings" });
  }
});

// ✅ Get booked times for a counselor on a specific date (prevents double booking)
app.get("/api/bookings/booked/:counselorId/:date", async (req, res) => {
  try {
    const { counselorId, date } = req.params;
    const bookings = await Booking.find({
      counselor: counselorId,
      date,
      status: { $ne: "canceled" },
    }).select("time");

    const bookedTimes = bookings.map((b) => ({ time: b.time }));
    res.json({ success: true, bookedTimes });
  } catch (error) {
    console.error("❌ Fetch booked times error:", error);
    res.status(500).json({ success: false, message: "Error fetching booked times" });
  }
});

// ✅ Counselor updates meeting info for a booking
app.put("/api/bookings/:id/meeting-info", async (req, res) => {
  try {
    const { meetingLink, meetingLocation, meetingDetails, endTime } = req.body;

    const updates = {};
    if (typeof meetingLink === 'string') updates.meetingLink = meetingLink;
    if (typeof meetingLocation === 'string') updates.meetingLocation = meetingLocation;
    if (typeof meetingDetails === 'string') updates.meetingDetails = meetingDetails;
    if (typeof endTime === 'string') updates.endTime = endTime;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error("❌ Update meeting info error:", error);
    res.status(500).json({ success: false, message: "Server error while updating meeting info" });
  }
});
