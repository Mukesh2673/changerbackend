const { body, validationResult, oneOf } = require("express-validator");

const validateAdvocate = [
  body("description").notEmpty().withMessage("Description is required"),
  body("title").notEmpty().withMessage("Description is required"),
  body("video").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Video file is required");
    }
    const validMimeTypes = ["video/mp4", "video/avi", "video/mkv", "video/mov"];
    if (!validMimeTypes.includes(req.file.mimetype)) {
      throw new Error("Invalid video file type");
    }
    return true;
  }),
  oneOf(
    [
      body("issue")
        .notEmpty()
        .withMessage("Issue is required if campaign and user are not provided"),
      body("campaign")
        .notEmpty()
        .withMessage("Campaign is required if issue and user are not provided"),
      body("user")
        .notEmpty()
        .withMessage("User is required if issue and campaign are not provided"),
    ],
    "At least one of issue, campaign, or user must be provided"
  ),
  body("location")
    .notEmpty()
    .withMessage("Location is required")
    .trim() // Trim whitespace characters
    .custom((location) => {
      try {
        const locationObj = JSON.parse(location);
        if (
          typeof locationObj !== "object" ||
          !locationObj.hasOwnProperty("type") ||
          !locationObj.hasOwnProperty("coordinates")
        ) {
          throw new Error("Invalid location format");
        }
        if (locationObj.type !== "Point") {
          throw new Error("Invalid location type");
        }
        if (
          !Array.isArray(locationObj.coordinates) ||
          locationObj.coordinates.length !== 2
        ) {
          throw new Error("Invalid coordinates format");
        }
        const [longitude, latitude] = locationObj.coordinates;
        if (typeof longitude !== "number" || typeof latitude !== "number") {
          throw new Error("Coordinates must be numbers");
        }
        return true;
      } catch (error) {
        throw new Error("Invalid location format");
      }
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }
    return next(); // Added return statement here
  },
];

module.exports = validateAdvocate;
