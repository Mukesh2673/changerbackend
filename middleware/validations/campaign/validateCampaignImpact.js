const { body, validationResult,param } = require("express-validator");
const validateImpact = [
  param('campaignId')
    .notEmpty()
    .withMessage('Campaign ID is required')
    .isMongoId()
    .withMessage('Campaign ID must be a valid MongoDB ID'),
  body("description").notEmpty().withMessage("Description is required"),
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

module.exports = validateImpact;
