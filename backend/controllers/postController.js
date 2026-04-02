const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");

// ── Create Post ─────────────────────────────────────────
const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;

    if (!text && !image) {
      return res
        .status(400)
        .json({ message: "Post must contain either text or an image" });
    }

    // Fetch the user to get the username
    const user = await User.findById(req.user.id).select("username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPost = await Post.create({
      userId: req.user.id,
      username: user.username,
      text: text || "",
      image: image || "",
    });

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Get Public Feed (All Posts) ─────────────────────────
const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "username profileImage")
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Get Explore (All Posts) ─────────────────────────────
const getExplore = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "username profileImage")
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Get Post By ID ──────────────────────────────────────
const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate("userId", "username profileImage bio");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Like / Unlike Post ──────────────────────────────────
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Fetch current user's username
    const user = await User.findById(req.user.id).select("username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const username = user.username;
    const index = post.likes.indexOf(username);

    if (index === -1) {
      // Like the post
      post.likes.push(username);
    } else {
      // Unlike the post
      post.likes.splice(index, 1);
    }

    await post.save();

    // Create notification for like (only if liking someone else's post)
    if (index === -1 && post.userId.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.userId,
        sender: req.user.id,
        type: "like",
        post: post._id,
      });
    }

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Comment on Post ─────────────────────────────────────
const commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Fetch current user's username
    const user = await User.findById(req.user.id).select("username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    post.comments.push({ username: user.username, text });
    await post.save();

    // Create notification for comment (only if commenting on someone else's post)
    if (post.userId.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.userId,
        sender: req.user.id,
        type: "comment",
        post: post._id,
      });
    }

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Delete Post ─────────────────────────────────────────
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only the post owner can delete
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Edit Post ───────────────────────────────────────────
const editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only the post owner can edit
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    // Update text
    if (text !== undefined) {
      post.text = text;
    }

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Delete Comment ──────────────────────────────────────
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the comment
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Fetch current user's username to verify ownership
    const user = await User.findById(req.user.id).select("username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Authorization: only the comment author or post owner can delete
    const isCommentAuthor = comment.username === user.username;
    const isPostOwner = post.userId.toString() === req.user.id;

    if (!isCommentAuthor && !isPostOwner) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    // Remove the comment
    post.comments.pull(commentId);
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Get User Posts ──────────────────────────────────────
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId })
      .populate("userId", "username profileImage")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Get User Liked Posts ────────────────────────────────
const getUserLikedPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ likes: user.username })
      .populate("userId", "username profileImage")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Get User Replies (Posts user commented on) ──────────
const getUserReplies = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ "comments.username": user.username })
      .populate("userId", "username profileImage")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
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
};
