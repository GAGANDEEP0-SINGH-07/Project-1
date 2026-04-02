const { body, validationResult } = require("express-validator");

// ── Validation Result Handler ──────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    message: "Validation failed",
    errors: extractedErrors,
  });
};

// ── Signup Validation ──────────────────────────────────
const signupValidationRules = () => {
  return [
    body("username")
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage("Username must be between 3 and 20 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),
    body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];
};

// ── Login Validation ───────────────────────────────────
const loginValidationRules = () => {
  return [
    body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

// ── Post Validation ────────────────────────────────────
const postValidationRules = () => {
  return [
    body("text").optional({ checkFalsy: true }).trim().isLength({ max: 5000 }).withMessage("Post content too long"),
    // check if either text or image is present in the controller, but here we validate types
  ];
};

module.exports = {
  validate,
  signupValidationRules,
  loginValidationRules,
  postValidationRules,
};
