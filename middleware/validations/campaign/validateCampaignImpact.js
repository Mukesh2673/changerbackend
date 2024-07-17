const { body, validationResult,param } = require("express-validator");
const validateImpact = [
  param('campaignId')
    .notEmpty()
    .withMessage((value,{ req}) =>req.__("CAMPAIGN_ID_REQUIRED"))
    .isMongoId()
    .withMessage((value,{ req}) =>req.__("CAMPAIGN_ID_MUST_BE_VALID")),
  body("description").notEmpty().withMessage(({ req}) =>req.__("DESCRIPTION_REQUIRED")),
  body("video").custom((value, { req }) => {
    if (!req.file) {
      throw new Error((value,{ req}) =>req.__("VIDEO_FILE_REQUIRED"));
    }
    const validMimeTypes = ["video/mp4", "video/avi", "video/mkv", "video/mov"];
    if (!validMimeTypes.includes(req.file.mimetype)) {
      throw new Error((value,{ req}) =>req.__("INVALID_VIDEO_FILE_TYPE"));
    }
    return true;
  }),
  body("location")
    .notEmpty()
    .withMessage((value,{ req}) =>req.__("LOCATION_REQUIRED"))
    .trim() // Trim whitespace characters
    .custom((location) => {
      try {
        const locationObj = JSON.parse(location);
        if (
          typeof locationObj !== "object" ||
          !locationObj.hasOwnProperty("type") ||
          !locationObj.hasOwnProperty("coordinates")
        ) {
          throw new Error((value,{ req}) =>req.__("INVALID_LOCATION_FORMAT"))
        }
        if (locationObj.type !== "Point") {
          throw new Error((value,{ req}) =>req.__("INVALID_LOCATION_TYPE"));
        }
        if (
          !Array.isArray(locationObj.coordinates) ||
          locationObj.coordinates.length !== 2
        ) {
          throw new Error((value,{ req}) =>req.__("INVALID_COORDINATEDS_FORMAT"));
        }
        const [longitude, latitude] = locationObj.coordinates;
        if (typeof longitude !== "number" || typeof latitude !== "number") {
          throw new Error((value,{ req}) =>req.__("CORDINATE_MUST_NUMBER"));
        }
        return true;
      } catch (error) {
        throw new Error((value,{ req}) =>req.__("INVALID_LOCATION_FORMAT"))
      }
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: res.__("VALIDATION_ERROR"),
        errors: errors.array(),
      });
    }
    return next(); // Added return statement here
  },
];

module.exports = validateImpact;
