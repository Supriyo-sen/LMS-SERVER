const express = require("express");
const {
  addCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { protect, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const {
  validateAddCourseInput,
  validateUpdateCourseInput,
  validateDeleteCourseInput,
} = require("../middlewares/validateUser");

const router = express.Router();

// Admin-only routes add course get all courses update course delete course
router.post(
  "/",
  protect,
  isAdmin,
  validateAddCourseInput,
  upload.array("files", 10),
  addCourse
);
router.get("/", protect, isAdmin, getAllCourses);
router.put(
  "/:id",
  protect,
  isAdmin,
  validateUpdateCourseInput,
  upload.single("image"),
  updateCourse
);
router.delete(
  "/:id",
  protect,
  isAdmin,
  validateDeleteCourseInput,
  deleteCourse
);

module.exports = router;
