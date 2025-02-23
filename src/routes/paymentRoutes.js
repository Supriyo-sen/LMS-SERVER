const express = require("express");
const {
  makePayment,
  getTransactions,
} = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Routes
router.post("/pay", protect, makePayment);
router.get("/transactions", protect, getTransactions);

module.exports = router;
