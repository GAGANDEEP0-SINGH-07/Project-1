const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Notification = require("../models/Notification");
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// ── Signup ──────────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with that email or username already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set HttpOnly Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Respond (exclude password)
    const { password: _, ...userData } = newUser.toObject();

    res.status(201).json({ user: userData });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Login ───────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set HttpOnly Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Respond (exclude password)
    const { password: _, ...userData } = user.toObject();

    res.status(200).json({ user: userData });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Logout ──────────────────────────────────────────────
const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// ── Get Current Profile (with stats) ──────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Count real posts
    const postCount = await Post.countDocuments({ userId: user._id });

    // Format the response with counts - using safe defaults for legacy users
    const userData = {
      ...user.toObject(),
      postCount: postCount || 0,
      followersCount: (user.followers || []).length,
      followingCount: (user.following || []).length,
    };

    res.status(200).json(userData);
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Follow / Unfollow User ──────────────────────────────
const followUser = async (req, res) => {
  try {
    const { id } = req.params; // ID of the user to follow
    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Defensive check for followers/following arrays
    if (!currentUser.following) currentUser.following = [];
    if (!userToFollow.followers) userToFollow.followers = [];

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(id);
      userToFollow.followers.pull(req.user.id);
    } else {
      // Follow
      currentUser.following.push(id);
      userToFollow.followers.push(req.user.id);

      // Create notification
      await Notification.create({
        recipient: id,
        sender: req.user.id,
        type: "follow",
      }).catch(err => console.error("Notification creation failed:", err));
    }

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ 
      isFollowing: !isFollowing,
      followersCount: (userToFollow.followers || []).length 
    });
  } catch (err) {
    console.error("followUser error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Update Profile ─────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { bio, location, profileImage, tagline } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (tagline !== undefined) user.tagline = tagline;

    await user.save();

    // Remove sensitive data
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// ── Get Public Profile By ID ───────────────────────────
const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Count real posts
    const postCount = await Post.countDocuments({ userId: user._id });

    // Format response
    const userData = {
      ...user.toObject(),
      postCount: postCount || 0,
      followersCount: (user.followers || []).length,
      followingCount: (user.following || []).length,
    };

    res.status(200).json(userData);
  } catch (err) {
    console.error("getProfileById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── ImageKit Auth Params ────────────────────────────────
const getImageKitAuth = (req, res) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.status(200).send(authParams);
  } catch (err) {
    res.status(500).json({ message: "ImageKit Auth Failed", error: err.message });
  }
};

module.exports = { 
  signup, 
  login, 
  logout,
  getMe, 
  followUser, 
  updateProfile, 
  getProfileById, 
  getImageKitAuth 
};
