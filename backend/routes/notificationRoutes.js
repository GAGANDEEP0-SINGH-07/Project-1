const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { 
  getNotifications, 
  markNotificationsAsRead 
} = require("../controllers/notificationController");

router.get("/", authMiddleware, getNotifications);
router.put("/mark-as-read", authMiddleware, markNotificationsAsRead);

module.exports = router;
