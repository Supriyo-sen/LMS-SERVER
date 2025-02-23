const express = require("express");
const { getUserInfo } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getUserInfo);

module.exports = router;
