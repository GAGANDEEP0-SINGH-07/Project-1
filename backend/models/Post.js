const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    likes: {
      type: [String],
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for performance optimization
postSchema.index({ userId: 1, createdAt: -1 }); // User profile feed
postSchema.index({ likes: 1, createdAt: -1 });  // Liked posts feed
postSchema.index({ "comments.username": 1, createdAt: -1 }); // Replies feed
postSchema.index({ createdAt: -1 }); // Main public feed

module.exports = mongoose.model("Post", postSchema);
