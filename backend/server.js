const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan"); // Added for better logging

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ── Middlewares ──────────────────────────────────────────

// 1. Logging Middleware (Must be before others)
app.use(morgan("dev"));

// 2. Parse Cookies FIRST (needed for auth)
app.use(cookieParser());

// 3. CORS Configuration (MOST IMPORTANT TO BE HIGH)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in the allowed list or is a Vercel subdomain
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith(".vercel.app") ||
                      origin.includes("localhost");

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("CORS Blocled for origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};
app.use(cors(corsOptions));

// 4. Body Parser with Size Limits (Must be before sanitization)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 5. Set Security Headers (Configured for cross-origin compliance)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP for local dev
  })
);

// 6. Prevent NoSQL Injection (Express 5 compatible - sanitized only body/params)
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
});

// 7. Compress Response Payloads
app.use(compression());

// 8. Trust Proxy (needed for rate limiting)
app.set("trust proxy", 1);

// 8. Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000, // Increased for stability
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", globalLimiter);
// 9. Auth Rate Limiter (Stricter for login/signup)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000, // 1 hour
  max: 15, // Increased slightly for usability
  message: { message: "Too many authentication attempts, please try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});


// ── Routes ─────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const imagekitRoutes = require("./routes/imagekitRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const searchRoutes = require("./routes/searchRoutes");

app.use("/api/auth", authRoutes); // authLimiter temporarily disabled for debugging
app.use("/api/posts", postRoutes);
app.use("/api/imagekit", imagekitRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);

// ── Error Handling ─────────────────────────────────────

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("GLOBAL_ERROR:", err.stack);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
