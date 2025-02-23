const Transaction = require("../models/transactionModel");
const Course = require("../models/courseModel");
const User = require("../models/userModel");
const dotenv = require("dotenv");

dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const makePayment = async (req, res) => {
  const { courseId, studentId, paymentMethodId } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: course.price * 100,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
    });

    if (paymentIntent.status === "succeeded") {
      if (course.enrolledStudents.includes(studentId)) {
        return res
          .status(400)
          .json({ message: "Student is already enrolled in this course" });
      }

      // Enroll the student in the course
      course.enrolledStudents.push(studentId);
      await course.save();

      // Log the transaction
      await Transaction.create({
        studentId,
        courseId,
        amount: course.price,
        status: "success",
      });

      res.status(200).json({
        message: "Payment successful, student enrolled in the course",
      });
    } else {
      res.status(400).json({ message: "Payment failed" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error processing payment", error: err.message });
  }
};

// Get all transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("studentId", "name email")
      .populate("courseId", "name");
    res.status(200).json(transactions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching transactions", error: err.message });
  }
};

module.exports = { makePayment, getTransactions };
