const { body, validationResult } = require("express-validator");
const validateSignedPetitions = [
  body("petition")
    .notEmpty()
    .withMessage(
      (value,{ req}) =>req.__("PETITION_REQUIRED")),
  body("address")
    .notEmpty()
    .withMessage(
      (value,{ req}) =>req.__("ADDRESS_REQUIRED")),
  body("location")
    .notEmpty()
    .withMessage( ({ req}) =>req.__("LOCATION_REQUIRED"))
    .custom((location) => {
      if (
        typeof location !== "object" ||
        !location.hasOwnProperty("type") ||
        !location.hasOwnProperty("coordinates")
      ) {
        throw new Error( value,({ req}) =>req.__("INVALID_LOCATION_FORMAT"));
      }
      if (location.type !== "Point") {
        throw new Error(value,({ req}) =>req.__("INVALID_LOCATION_TYPE"));
      }
      if (
        !Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2
      ) {
        throw new Error(value,({ req}) =>req.__("INVALID_COORDINATEDS_FORMAT"));
      }
      const [longitude, latitude] = location.coordinates;
      if (typeof longitude !== "number" || typeof latitude !== "number") {
        throw new Error(value,({ req}) =>req.__("CORDINATE_MUST_NUMBER"));
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message:  res.__("VALIDATION_ERROR"),
        errors: errors.array(),
      });
    }
    return next(); // Added return statement here
  },
];

module.exports = validateSignedPetitions;
