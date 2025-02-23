const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token = req.cookies?.auth_token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token found", status: "false" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    res
      .status(401)
      .json({ message: "Not authorized, token failed", status: "false" });
  }
};

// Admin check
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied, admin only" });
  }
  next();
};

module.exports = { protect, isAdmin };
