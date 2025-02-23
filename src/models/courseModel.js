const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Course name is required"],
    },
    image: {
      type: String,
      required: [true, "Course image is required"],
    },
    price: {
      type: Number,
      required: [true, "Course price is required"],
    },
    discountPrice: {
      type: Number,
      required: [true, "Discount price is required"],
    },
    oldCoursePrice: {
      type: Number,
      required: [true, "Old course price is required"],
    },
    numberOfLessons: {
      type: Number,
      required: [true, "Number of lessons is required"],
    },
    duration: {
      type: String,
      required: [true, "Course duration is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Course start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Course end date is required"],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    liveClasses: [
      {
        name: { type: String, required: true },
        schedule: { type: Date, required: true },
        duration: { type: String, required: true },
        status: {
          type: String,
          enum: ["upcoming", "running", "completed"],
          default: "upcoming",
        },
      },
    ],
    materials: {
      pdfs: [{ name: { type: String }, file: { type: String } }],
      videos: [{ name: { type: String }, file: { type: String } }],
    },
    courseState: {
      type: String,
      enum: ["upcoming", "running", "completed"],
      default: "upcoming",
    },
    allowNewEnrollments: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", courseSchema);
