const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/authController");
const { protect }  = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { registerRules, loginRules, validate } = require("../middleware/validators");

// Public
router.post("/register", authLimiter, registerRules, validate, ctrl.register);
router.post("/login",    authLimiter, loginRules,    validate, ctrl.login);
router.post("/refresh",  authLimiter, ctrl.refreshToken);

// Protected
router.use(protect);
router.post("/logout",           ctrl.logout);
router.get ("/me",               ctrl.getMe);
router.patch("/me",              ctrl.updateMe);
router.patch("/me/password",     ctrl.changePassword);

module.exports = router;
