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
    liveClasses, // expecting liveClasses if provided
  } = req.body;

  console.log("req.body", req.body);

  try {
    // Validate that startDate is before endDate
    // if (new Date(startDate) >= new Date(endDate)) {
    //   return res
    //     .status(400)
    //     .json({ message: "Start date must be before end date" });
    // }

    let courseImage = null;
    let materials = [];

    // Process uploaded files (assumes multer has provided req.files)
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Check if the file is an image (using mimetype)
        if (file.mimetype.startsWith("image/")) {
          // Only use the first image as the course image
          if (!courseImage) {
            courseImage = file.path;
          }
        } else {
          // For other files, add to materials with original name and file path
          materials.push({
            name: file.originalname || "Material",
            file: file.path,
          });
        }
      });
    }

    // Ensure a course image is provided as required by the schema
    // if (!courseImage) {
    //   return res.status(400).json({ message: "Course image is required" });
    // }

    // Process liveClasses if provided; allow JSON string or array input
    let liveClassesArr = [];
    if (liveClasses) {
      if (typeof liveClasses === "string") {
        try {
          liveClassesArr = JSON.parse(liveClasses);
        } catch (error) {
          return res
            .status(400)
            .json({ message: "Invalid liveClasses format" });
        }
      } else if (Array.isArray(liveClasses)) {
        liveClassesArr = liveClasses;
      }
    }

    // Create the course using the updated schema fields
    const course = await Course.create({
      name,
      image: courseImage,
      price,
      discountPrice,
      oldCoursePrice,
      numberOfLessons,
      duration,
      startDate,
      endDate,
      liveClasses: liveClassesArr,
      materials, // an array of { name, file } objects
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
