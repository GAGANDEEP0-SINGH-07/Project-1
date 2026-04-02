const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createPost,
  getFeed,
  getExplore,
  getPostById,
  likePost,
  commentOnPost,
  deletePost,
  editPost,
  deleteComment,
  getUserPosts,
  getUserLikedPosts,
  getUserReplies,
} = require("../controllers/postController");

// All routes below are protected by authMiddleware
router.post("/create", authMiddleware, createPost);
router.get("/feed", authMiddleware, getFeed);
router.get("/explore", authMiddleware, getExplore);
router.get("/:postId", authMiddleware, getPostById);
router.put("/like/:postId", authMiddleware, likePost);
router.put("/comment/:postId", authMiddleware, commentOnPost);
router.put("/edit/:postId", authMiddleware, editPost);
router.delete("/delete/:postId", authMiddleware, deletePost);
router.delete("/comment/:postId/:commentId", authMiddleware, deleteComment);

// User-specific Profile Routes
router.get("/user/:userId", authMiddleware, getUserPosts);
router.get("/liked/:userId", authMiddleware, getUserLikedPosts);
router.get("/replies/:userId", authMiddleware, getUserReplies);

module.exports = router;
