const User = require("../models/User");
const Post = require("../models/Post");

const searchAll = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(200).json({ users: [], posts: [] });
    }

    const regex = new RegExp(q, "i");

    // Search Users
    const users = await User.find({
      $or: [
        { username: regex },
        { email: regex }
      ]
    })
    .select("username profileImage bio")
    .limit(5);

    // Search Posts
    const posts = await Post.find({ text: regex })
    .populate("userId", "username profileImage")
    .sort({ createdAt: -1 })
    .limit(5);

    res.status(200).json({ users, posts });
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
};

module.exports = { searchAll };
