const User = require("../models/userModel");
const Course = require("../models/courseModel");

// Get all students and teachers
const getAllUsers = async (req, res) => {
  const { role } = req.query;

  try {
    const filter = role ? { role } : {};
    const users = await User.find(filter).select("-password");

    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
};

// Change students and teachers Password
const changeUserPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update password
    user.password = password;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating password", error: err.message });
  }
};

// Delete students and teachers
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Prevent self-deletion
    if (req.user._id.toString() === id) {
      return res
        .status(403)
        .json({ message: "You cannot delete your own account" });
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete user from the database
    await user.deleteOne();

    // ✅ Instruct frontend to remove cookies for this user
    res.status(200).json({
      message: `User with ID ${id} deleted successfully`,
      removeCookies: true, // 🚀 Frontend will use this flag to remove cookies
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
};

// Enroll a student
const enrollStudent = async (req, res) => {
  const { id: courseId } = req.params;
  const { studentId } = req.body;

  try {
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    if (course.enrolledStudents.includes(studentId)) {
      return res
        .status(400)
        .json({ message: "Student is already enrolled in this course" });
    }

    course.enrolledStudents.push(studentId);
    await course.save();

    res.status(200).json({ message: "Student enrolled successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error enrolling student", error: err.message });
  }
};

// Get enrolled students for a course
const getEnrolledStudents = async (req, res) => {
  const { id: courseId } = req.params;

  try {
    const course = await Course.findById(courseId).populate(
      "enrolledStudents",
      "name email"
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course.enrolledStudents);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching enrolled students",
      error: err.message,
    });
  }
};

// Remove a student from a course
const removeStudent = async (req, res) => {
  const { id: courseId, studentId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.enrolledStudents = course.enrolledStudents.filter(
      (id) => id.toString() !== studentId
    );
    await course.save();

    res.status(200).json({ message: "Student removed successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error removing student", error: err.message });
  }
};

// Add a teacher to a course
const addTeacherToCourse = async (req, res) => {
  const { id: courseId } = req.params;
  const { teacherId } = req.body;
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({ message: "Invalid teacher ID" });
    }

    if (course.teacherId && course.teacherId !== null) {
      return res.status(400).json({ message: "Course already has a teacher" });
    }

    course.teacherId = teacherId;
    await course.save();

    res.status(200).json({ message: "Teacher added successfully", course });
  } catch (error) {
    res.status(500).json({
      message: "Error adding teacher to course",
      error: error.message,
    });
  }
};

// Remove a teacher from a course
const removeTeacherFromCourse = async (req, res) => {
  const { id: courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.teacherId) {
      return res
        .status(400)
        .json({ message: "Course does not have a teacher" });
    }

    course.teacherId = null;
    await course.save();

    res.status(200).json({ message: "Teacher removed successfully", course });
  } catch (error) {
    res.status(500).json({
      message: "Error removing teacher from course",
      error: error.message,
    });
  }
};

module.exports = {
  changeUserPassword,
  deleteUser,
  getAllUsers,
  enrollStudent,
  getEnrolledStudents,
  removeStudent,
  addTeacherToCourse,
  removeTeacherFromCourse,
};
