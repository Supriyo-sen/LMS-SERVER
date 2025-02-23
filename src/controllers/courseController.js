const Course = require("../models/courseModel");
const User = require("../models/userModel");

// Add a new course
const addCourse = async (req, res) => {
  const {
    name,
    price,
    discountPrice,
    oldCoursePrice,
    numberOfLessons,
    duration,
    startDate,
    endDate,
    teacherId,
  } = req.body;

  try {
    if (new Date(startDate) >= new Date(endDate)) {
      return res
        .status(400)
        .json({ message: "Start date must be before end date" });
    }

    let imageUrl = null;
    let videos = [];
    let pdfs = [];

    if (req.files) {
      req.files.forEach((file) => {
        const mimeType = file.mimetype.split("/")[0];

        if (mimeType === "image") {
          imageUrl = file.path;
        } else if (mimeType === "video") {
          videos.push(file.path);
        } else if (
          file.mimetype === "application/pdf" ||
          file.mimetype.includes("msword")
        ) {
          pdfs.push(file.path);
        }
      });
    }

    const course = await Course.create({
      name,
      image: imageUrl,
      price,
      discountPrice,
      oldCoursePrice,
      numberOfLessons,
      duration,
      startDate,
      endDate,
      teacherId,
      materials: {
        pdfs,
        videos,
      },
    });

    res.status(201).json({ message: "Course added successfully", course });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error adding course", error: err.message });
  }
};

// Get all courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("teacherId", "name email"); // Populate teacher details
    res.status(200).json(courses);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching courses", error: err.message });
  }
};

// Update a course
const updateCourse = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    image,
    price,
    discountPrice,
    oldCoursePrice,
    numberOfLessons,
    duration,
    startDate,
    endDate,
    teacherId,
    materials,
    liveClasses,
  } = req.body;

  try {
    const course = await Course.findByIdAndUpdate(
      id,
      {
        name,
        image,
        price,
        discountPrice,
        oldCoursePrice,
        numberOfLessons,
        duration,
        startDate,
        endDate,
        teacherId,
        materials,
        liveClasses,
      },
      { new: true, runValidators: true } // Return the updated document and validate input
    );

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.status(200).json({ message: "Course updated successfully", course });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error updating course", error: err.message });
  }
};

// Delete a course
const deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findByIdAndDelete(id);

    if (!course) return res.status(404).json({ message: "Course not found" });

    res
      .status(200)
      .json({ message: `Course with ID ${id} deleted successfully` });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting course", error: err.message });
  }
};

module.exports = { addCourse, getAllCourses, updateCourse, deleteCourse };
