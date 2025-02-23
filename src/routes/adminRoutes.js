const express = require("express");
const {
  changeUserPassword,
  deleteUser,
  getAllUsers,
  enrollStudent,
  getEnrolledStudents,
  removeStudent,
  addTeacherToCourse,
  removeTeacherFromCourse,
} = require("../controllers/adminController");
const { protect, isAdmin } = require("../middlewares/authMiddleware");
const {
  validateChangeUserPasswordInput,
} = require("../middlewares/validateUser");

const router = express.Router();

// Admin-only routes for all teacher and students
router.put(
  "/change-password/:id",
  protect,
  validateChangeUserPasswordInput,
  isAdmin,
  changeUserPassword
);
router.delete("/delete-user/:id", protect, isAdmin, deleteUser);
router.get("/users", protect, getAllUsers);

// Admin-only routes for courses (students)
router.post("/:id/enroll", protect, isAdmin, enrollStudent);
router.get("/:id/enrollments", protect, isAdmin, getEnrolledStudents);
router.delete("/:id/enroll/:studentId", protect, isAdmin, removeStudent);

// Admin-only routes for courses (teachers)
router.post("/:id/assign-teacher", protect, isAdmin, addTeacherToCourse);
router.delete("/:id/remove-teacher", protect, isAdmin, removeTeacherFromCourse);

module.exports = router;
