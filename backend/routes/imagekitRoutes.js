const express = require("express");
const router = express.Router();
const { getAuthParams } = require("../controllers/imagekitController");

// GET /api/imagekit/auth — returns auth params for client-side upload
router.get("/auth", getAuthParams);

module.exports = router;
