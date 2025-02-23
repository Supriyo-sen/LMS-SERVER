const User = require("../models/userModel");

// Get user info
const getUserInfo = async (req, res) => {
  try {
    if (!req.cookies.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Decode user data
    const user = JSON.parse(req.cookies.user);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user data" });
  }
};

module.exports = { getUserInfo };
