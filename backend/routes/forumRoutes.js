import express from "express";
import ForumPost from "../models/ForumPost.js";
import User from "../models/User.js";

const router = express.Router();

// List posts (basic pagination optional later)
router.get("/posts", async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .sort({ createdAt: -1 })
      .populate("author", "name role canPost")
      .select("title content tags createdAt author comments likes");
    res.json({ success: true, data: posts });
  } catch (err) {
    console.error("Forum list error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create post (expects authorId from client for now)
router.post("/posts", async (req, res) => {
  try {
    const { authorId, title, content, tags } = req.body;
    if (!authorId || !title || !content) {
      return res.status(400).json({ success: false, message: "authorId, title, and content are required" });
    }
    const author = await User.findById(authorId);
    if (!author || author.role !== 'student') {
      return res.status(403).json({ success: false, message: "Only students can post" });
    }
    if (author.canPost === false) {
      return res.status(403).json({ success: false, message: author.postRestrictionReason || "Posting is currently restricted for this student." });
    }
    const post = await ForumPost.create({ author: authorId, title, content, tags: Array.isArray(tags) ? tags : [] });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    console.error("Forum create error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get one post
router.get("/posts/:id", async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate("author", "name role")
      .populate("comments.author", "name role");
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add a comment (student only for now)
router.post("/posts/:id/comments", async (req, res) => {
  try {
    const { authorId, content } = req.body;
    if (!authorId || !content) return res.status(400).json({ success: false, message: "authorId and content required" });
    const user = await User.findById(authorId);
    if (!user || user.role !== 'student') return res.status(403).json({ success: false, message: "Only students can comment" });
    if (user.canPost === false) {
      return res.status(403).json({ success: false, message: user.postRestrictionReason || "Posting is currently restricted for this student." });
    }
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    post.comments.push({ author: authorId, content });
    await post.save();
    const populated = await post.populate("comments.author", "name role");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a post (counselor only)
router.delete("/posts/:id", async (req, res) => {
  try {
    const actorId = req.header('x-user-id') || (req.body && req.body.actorId);
    if (!actorId) {
      return res.status(400).json({ success: false, message: "actorId is required" });
    }
    const actor = await User.findById(actorId);
    if (!actor || actor.role !== 'counselor') {
      return res.status(403).json({ success: false, message: "Only counselors can delete posts" });
    }
    const deleted = await ForumPost.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Post not found" });
    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    console.error("Forum delete error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Restrict or allow a student to post (counselor only)
router.post("/restrict", async (req, res) => {
  try {
    const { counselorId, studentId, canPost, reason } = req.body || {};
    if (typeof canPost !== 'boolean' || !counselorId || !studentId) {
      return res.status(400).json({ success: false, message: "counselorId, studentId and boolean canPost are required" });
    }
    const counselor = await User.findById(counselorId);
    if (!counselor || counselor.role !== 'counselor') {
      return res.status(403).json({ success: false, message: "Only counselors can update posting permissions" });
    }
    const student = await User.findByIdAndUpdate(
      studentId,
      { canPost, postRestrictionReason: canPost ? "" : (reason || "Posting is restricted by counselor.") },
      { new: true }
    ).select('name role canPost postRestrictionReason');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, data: student });
  } catch (err) {
    console.error("Forum restrict error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
