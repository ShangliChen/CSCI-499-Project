// routes/counselorRequestRoutes.js
import express from 'express';
import User from '../models/User.js'; // Import User model to check student/counselor existence
import Request from '../models/Request.js'; // Import the Request model

const router = express.Router();

// POST route to send a request to a counselor
router.post('/', async (req, res) => {
  const { studentId, counselorId } = req.body;

  if (!studentId || !counselorId) {
    return res.status(400).json({ success: false, message: "Student ID and Counselor ID are required." });
  }

  try {
    // Check if the student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    // Check if the counselor exists
    const counselor = await User.findById(counselorId);
    if (!counselor || counselor.role !== 'counselor') {
      return res.status(404).json({ success: false, message: "Counselor not found." });
    }

    // Create a new request
    const newRequest = new Request({
      studentId,
      counselorId,
      status: 'pending', // Default status is "pending"
    });

    await newRequest.save();

    // Send response
    res.status(201).json({
      success: true,
      message: `Request successfully sent to ${counselor.name}.`,
      counselorName: counselor.name, // Send counselor's name back in the response
    });
  } catch (err) {
    console.error("Error sending request:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// GET all requests for a counselor
router.get('/:counselorId', async (req, res) => {
  const { counselorId } = req.params;

  try {
    const requests = await Request.find({ counselorId })
      .populate('studentId', 'name email school_id') // populate student info
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching counselor requests:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET current request for a student
router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    // Find the latest request for this student
    const request = await Request.findOne({ studentId })
      .populate('counselorId', 'name email specialization targetStudent sessionType') // counselor info
      .sort({ createdAt: -1 }); // get the latest request

    if (!request) {
      return res.json({ success: true, request: null });
    }

    // Return request info along with counselor details
    res.json({
      success: true,
      request: {
        _id: request._id,
        status: request.status,
        counselor: {
          _id: request.counselorId._id,
          name: request.counselorId.name,
          email: request.counselorId.email,
          specialization: request.counselorId.specialization,
          targetStudent: request.counselorId.targetStudent,
          sessionType: request.counselorId.sessionType,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// GET assigned students for a counselor (accepted requests only)
router.get("/assigned/:counselorId", async (req, res) => {
  const { counselorId } = req.params;

  try {
    const assignedRequests = await Request.find({
      counselorId,
      status: "accepted",
    })
      .populate("studentId", "name school_id assessment_date assessment_score")
      .sort({ createdAt: -1 });

    // remove duplicate student entries
    const students = assignedRequests
      .map((req) => req.studentId)
      .filter(
        (student, index, self) =>
          index ===
          self.findIndex((s) => s._id.toString() === student._id.toString())
      );

    res.json({ success: true, students });
  } catch (err) {
    console.error("Error fetching assigned students:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});










// Accept or Reject request
router.put('/:requestId/:action', async (req, res) => {
  const { requestId, action } = req.params;

  if (!["accepted", "rejected"].includes(action)) {
    return res.status(400).json({ success: false, message: "Invalid action" });
  }

  try {
    const updated = await Request.findByIdAndUpdate(
      requestId,
      { status: action },
      { new: true }
    );

    res.json({ success: true, updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE a student request
router.delete('/:requestId', async (req, res) => {
  const { requestId } = req.params;
  try {
    await Request.findByIdAndDelete(requestId);
    res.json({ success: true, message: "Request cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});




export default router;
