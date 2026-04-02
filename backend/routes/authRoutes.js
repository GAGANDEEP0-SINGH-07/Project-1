const express = require("express");
const router = express.Router();
const { 
  signup, 
  login, 
  logout,
  getMe, 
  followUser,
  updateProfile,
  getProfileById,
  getImageKitAuth 
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const { 
  signupValidationRules, 
  loginValidationRules, 
  validate 
} = require("../middleware/validation");

// POST /api/auth/signup
router.post("/signup", signupValidationRules(), validate, signup);

// POST /api/auth/login
router.post("/login", loginValidationRules(), validate, login);

// POST /api/auth/logout
router.post("/logout", logout);

// GET /api/auth/me
router.get("/me", authMiddleware, getMe);
router.get("/profile/:id", authMiddleware, getProfileById);
router.post("/follow/:id", authMiddleware, followUser);
router.put("/profile", authMiddleware, updateProfile);
router.get("/imagekit-auth", getImageKitAuth);

module.exports = router;
