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
