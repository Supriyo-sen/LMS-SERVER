const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
} = require("../controllers/authController");
const {
  validateRegisterInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} = require("../middlewares/validateUser");
const router = express.Router();

router.post("/register", validateRegisterInput, registerUser);
router.post("/login", validateLoginInput, loginUser);
router.post("/forgotpassword", validateForgotPasswordInput, forgotPassword);
router.post("/reset-password", validateResetPasswordInput, resetPassword);
router.post("/logout", logoutUser);

module.exports = router;
