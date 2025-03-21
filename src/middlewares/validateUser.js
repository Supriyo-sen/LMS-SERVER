const validateRegisterInput = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  if (name.length < 3) {
    return res
      .status(400)
      .json({ message: "Name must be at least 3 characters" });
  }

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  }

  if (role !== "admin" && role !== "teacher" && role !== "student") {
    return res
      .status(400)
      .json({ message: "Role must be either teacher, or student" });
  }

  // If validation passes, call the next middleware
  next();
};

const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  // If validation passes, call the next middleware
  next();
};

const validateForgotPasswordInput = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  // If validation passes, call the next middleware
  next();
};

const validateResetPasswordInput = (req, res, next) => {
  const { password, token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  // If validation passes, call the next middleware
  next();
};

const validateChangeUserPasswordInput = (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  // If validation passes, call the next middleware
  next();
};

const validateAddCourseInput = (req, res, next) => {
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
    liveClasses,
    materials,
  } = req.body;

  if (!name || name.length < 3) {
    return res
      .status(400)
      .json({ message: "Course name must be at least 3 characters long" });
  }

  if (!image || typeof image !== "object") {
    return res
      .status(400)
      .json({ message: "Course image is required and must be a valid object" });
  } else {
    const { name, size, type } = image;

    // Ensure the image has name, size, and type properties
    if (!name || !size || !type) {
      return res.status(400).json({
        message: "Course image must have a valid name, size, and type",
      });
    }

    // Allowed image types
    const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

    // Validate image type
    if (!allowedImageTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid image format: ${type}. Allowed formats: JPEG, PNG, JPG`,
      });
    }

    // Validate image size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (size > maxSize) {
      return res.status(400).json({
        message: `Image size exceeds 5MB limit: ${name}`,
      });
    }
  }

  if (!price || isNaN(price) || price <= 0) {
    return res
      .status(400)
      .json({ message: "Course price must be a positive number" });
  }

  if (
    discountPrice &&
    (isNaN(discountPrice) || discountPrice < 0 || discountPrice > price)
  ) {
    return res.status(400).json({
      message:
        "Discount price must be a positive number and less than course price",
    });
  }

  if (!oldCoursePrice || isNaN(oldCoursePrice) || oldCoursePrice < 0) {
    return res
      .status(400)
      .json({ message: "Old course price must be a positive number" });
  }

  if (!numberOfLessons || isNaN(numberOfLessons) || numberOfLessons <= 0) {
    return res
      .status(400)
      .json({ message: "Number of lessons must be a positive number" });
  }

  if (!duration) {
    return res.status(400).json({ message: "Course duration is required" });
  }

  if (!startDate || !endDate) {
    return res.status(400).json({
      message: "Start and end dates are required",
    });
  }
  if (new Date(startDate) >= new Date(endDate)) {
    return res
      .status(400)
      .json({ message: "Start date must be before end date" });
  }

  if (liveClasses && !Array.isArray(liveClasses)) {
    return res
      .status(400)
      .json({ message: "Live classes must be an array of objects" });
  }
  if (liveClasses) {
    for (const liveClass of liveClasses) {
      const { name, schedule, duration, status } = liveClass;

      if (!name || name.length < 3) {
        return res.status(400).json({
          message:
            "Each live class must have a valid name of at least 3 characters",
        });
      }
      if (!schedule || isNaN(new Date(schedule).getTime())) {
        return res
          .status(400)
          .json({ message: "Each live class must have a valid schedule date" });
      }

      if (new Date(schedule) <= new Date()) {
        return res.status(400).json({
          message: "Each live class must have a future schedule date",
        });
      }

      if (liveClasses.length > 1) {
        for (let i = 0; i < liveClasses.length; i++) {
          if (i !== 0) {
            if (
              new Date(liveClasses[i].schedule) <=
              new Date(liveClasses[i - 1].schedule)
            ) {
              return res.status(400).json({
                message: "Each live class must have a future schedule date",
              });
            }
          }
        }
      }

      if (!duration || duration.length < 2) {
        return res
          .status(400)
          .json({ message: "Each live class must have a valid duration" });
      }
      if (!["upcoming", "running", "completed"].includes(status)) {
        return res.status(400).json({
          message:
            "Each live class must have a valid status (upcoming, running, completed)",
        });
      }
    }
  }

  if (materials) {
    if (!Array.isArray(materials)) {
      return res
        .status(400)
        .json({ message: "Materials must be an array of objects" });
    }

    for (const material of materials) {
      // Validate name
      if (!material.name || material.name.length < 3) {
        return res.status(400).json({
          message:
            "Each material must have a valid name of at least 3 characters",
        });
      }

      // Validate file object
      if (!material.file || typeof material.file !== "object") {
        return res.status(400).json({
          message: "Each material must contain a valid file object",
        });
      }

      const { name, size, type } = material.file;

      // Ensure file has name, size, and type
      if (!name || !size || !type) {
        return res.status(400).json({
          message: "Each material file must have a valid name, size, and type",
        });
      }

      // Allowed file types
      const allowedFileTypes = {
        pdf: ["application/pdf"],
        doc: [
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        image: ["image/jpeg", "image/png", "image/jpg"],
        video: ["video/mp4", "video/mov", "video/avi"],
      };

      // Check if file type is valid
      const isValidFileType = Object.values(allowedFileTypes).some((types) =>
        types.includes(type)
      );

      if (!isValidFileType) {
        return res.status(400).json({
          message: `Invalid file type: ${type}. Allowed types: PDF, DOC, Image (JPG, PNG), Video (MP4, MOV, AVI)`,
        });
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (size > maxSize) {
        return res.status(400).json({
          message: `File size exceeds 5MB limit: ${name}`,
        });
      }
    }
  }

  // If all validations pass
  next();
};

const validateUpdateCourseInput = (req, res, next) => {
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
    liveClasses,
    materials,
  } = req.body;

  if (!name || name.length < 3) {
    return res
      .status(400)
      .json({ message: "Course name must be at least 3 characters long" });
  }

  if (!image) {
    return res.status(400).json({ message: "Course image is required" });
  }

  if (!price || isNaN(price) || price <= 0) {
    return res
      .status(400)
      .json({ message: "Course price must be a positive number" });
  }

  if (
    discountPrice &&
    (isNaN(discountPrice) || discountPrice < 0 || discountPrice > price)
  ) {
    return res.status(400).json({
      message:
        "Discount price must be a positive number and less than course price",
    });
  }

  if (!oldCoursePrice || isNaN(oldCoursePrice) || oldCoursePrice < 0) {
    return res
      .status(400)
      .json({ message: "Old course price must be a positive number" });
  }

  if (!numberOfLessons || isNaN(numberOfLessons) || numberOfLessons <= 0) {
    return res
      .status(400)
      .json({ message: "Number of lessons must be a positive number" });
  }

  if (!duration) {
    return res.status(400).json({ message: "Course duration is required" });
  }

  if (!startDate || !endDate) {
    return res.status(400).json({
      message: "Start and end dates are required",
    });
  }
  if (new Date(startDate) >= new Date(endDate)) {
    return res
      .status(400)
      .json({ message: "Start date must be before end date" });
  }

  if (liveClasses && !Array.isArray(liveClasses)) {
    return res
      .status(400)
      .json({ message: "Live classes must be an array of objects" });
  }
  if (liveClasses) {
    for (const liveClass of liveClasses) {
      const { name, schedule, duration, status } = liveClass;

      if (!name || name.length < 3) {
        return res.status(400).json({
          message:
            "Each live class must have a valid name of at least 3 characters",
        });
      }
      if (!schedule || isNaN(new Date(schedule).getTime())) {
        return res
          .status(400)
          .json({ message: "Each live class must have a valid schedule date" });
      }
      if (new Date(schedule) <= new Date()) {
        return res.status(400).json({
          message: "Each live class must have a future schedule date",
        });
      }

      if (liveClasses.length > 1) {
        for (let i = 0; i < liveClasses.length; i++) {
          if (i !== 0) {
            if (
              new Date(liveClasses[i].schedule) <=
              new Date(liveClasses[i - 1].schedule)
            ) {
              return res.status(400).json({
                message: "Each live class must have a future schedule date",
              });
            }
          }
        }
      }
      if (!duration || duration.length < 2) {
        return res
          .status(400)
          .json({ message: "Each live class must have a valid duration" });
      }
      if (!["upcoming", "running", "completed"].includes(status)) {
        return res.status(400).json({
          message:
            "Each live class must have a valid status (upcoming, running, completed)",
        });
      }
    }
  }

  if (materials) {
    const { pdfs, videos } = materials;

    if (pdfs && !Array.isArray(pdfs)) {
      return res
        .status(400)
        .json({ message: "Materials PDFs must be an array of objects" });
    }
    if (pdfs) {
      for (const pdf of pdfs) {
        if (!pdf.name || pdf.name.length < 3) {
          return res.status(400).json({
            message: "Each PDF must have a valid name of at least 3 characters",
          });
        }
        if (!pdf.file || !pdf.file.startsWith("http")) {
          return res
            .status(400)
            .json({ message: "Each PDF must have a valid file URL" });
        }
      }
    }

    if (videos && !Array.isArray(videos)) {
      return res
        .status(400)
        .json({ message: "Materials videos must be an array of objects" });
    }
    if (videos) {
      for (const video of videos) {
        if (!video.name || video.name.length < 3) {
          return res.status(400).json({
            message:
              "Each video must have a valid name of at least 3 characters",
          });
        }
        if (!video.file || !video.file.startsWith("http")) {
          return res
            .status(400)
            .json({ message: "Each video must have a valid file URL" });
        }
      }
    }
  }

  // If all validations pass
  next();
};

const validateDeleteCourseInput = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  // If validation passes, call the next middleware
  next();
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
  validateChangeUserPasswordInput,
  validateAddCourseInput,
  validateUpdateCourseInput,
  validateDeleteCourseInput,
};
