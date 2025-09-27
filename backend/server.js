import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors()); // allow React frontend
app.use(express.json()); // parse JSON bodies


// ✅ Root route (to avoid 404 on http://localhost:5000/)
app.get("/", (req, res) => {
  res.send("🚀 Server is running on port 5000");
});

// Student signup
app.post("/signup/student", (req, res) => {
  const { school_id, email, password } = req.body;
  console.log("📌 Student signup:", req.body);
  // TODO: Save to MongoDB later
  res.json({ success: true, message: "Student registered" });
});

// Counselor signup
app.post("/signup/counselor", (req, res) => {
  const { school_id, email, password, license, photo_id } = req.body;
  console.log("📌 Counselor signup:", req.body);
  // TODO: Save to MongoDB later
  res.json({ success: true, message: "Counselor registered" });
});

// Student login
app.post("/login/student", (req, res) => {
  const { school_id, password } = req.body;
  console.log("📌 Student login:", req.body);
  // TODO: Check MongoDB later
  res.json({ success: true, role: "student" });
});

// Counselor login
app.post("/login/counselor", (req, res) => {
  const { school_id, password } = req.body;
  console.log("📌 Counselor login:", req.body);
  // TODO: Check MongoDB later
  res.json({ success: true, role: "counselor" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
