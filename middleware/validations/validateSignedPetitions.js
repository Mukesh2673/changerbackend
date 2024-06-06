const { body, validationResult } = require("express-validator");
const validateSignedPetitions = [
  body("petition")
    .notEmpty()
    .withMessage(
      "petition is required"
    ),
  body("location")
    .notEmpty()
    .withMessage("Location is required")
    .custom((location) => {
      if (
        typeof location !== "object" ||
        !location.hasOwnProperty("type") ||
        !location.hasOwnProperty("coordinates")
      ) {
        throw new Error("Invalid location format");
      }
      if (location.type !== "Point") {
        throw new Error("Invalid location type");
      }
      if (
        !Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2
      ) {
        throw new Error("Invalid coordinates format");
      }
      const [longitude, latitude] = location.coordinates;
      if (typeof longitude !== "number" || typeof latitude !== "number") {
        throw new Error("Coordinates must be numbers");
      }
      return true;
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

module.exports = validateSignedPetitions;
