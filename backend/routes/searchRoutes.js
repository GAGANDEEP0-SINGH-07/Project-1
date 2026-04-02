const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { searchAll } = require("../controllers/searchController");

// GET /api/search?q=...
router.get("/", authMiddleware, searchAll);

module.exports = router;
