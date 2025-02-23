const crypto = require("crypto");
const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const sendEmail = require("../utils/sendEmail");
const { generateToken } = require("../utils/generateToken");

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ message: "User already exists with this email" });

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      res.cookie("auth_token", generateToken(user._id), {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      res.cookie("user", JSON.stringify(userData), {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
        message: "User registered successfully",
        status: "true",
      });
    }
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error registering user",
      error: err.message,
      status: "false",
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      res.cookie("user", JSON.stringify(userData), {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
        message: "User logged in successfully",
        status: "true",
      });
    } else {
      res.status(401).json({
        message: "Invalid email or password",
        status: "false",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Error logging in user",
      error: err.message,
      status: "false",
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save token to the database
    await new Token({
      userId: user._id,
      token: resetToken,
    }).save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password`;
    const message = `
      <h2>Password Reset Request</h2>
      <p>Your password reset token is: ${resetToken}</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    `;

    await sendEmail(user.email, "Password Reset Request", message);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error sending reset email", error: err.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const resetToken = await Token.findOne({ token });
    if (!resetToken)
      return res.status(400).json({ message: "Invalid or expired token" });

    const user = await User.findById(resetToken.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update user password

    user.password = password;
    await user.save();

    // Delete the token after use
    await resetToken.deleteOne();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error resetting password", error: err.message });
  }
};

// Logout user
const logoutUser = (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });

  res.clearCookie("user", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
};
