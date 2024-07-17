const { body, validationResult, oneOf } = require("express-validator");

const validateAdvocate = [
  body("description").notEmpty().withMessage(({ req}) =>req.__("DESCRIPTION_REQUIRED")),
  body("title").notEmpty().withMessage(({ req}) =>req.__("TITLE_REQUIRED")),
  body("video").custom(({value, req }) => {
    if (!req.file) {
      throw new Error((value,{req})=>req.__("ADVOCATE_ID_REQUIRE"));
    }
    const validMimeTypes = ["video/mp4", "video/avi", "video/mkv", "video/mov"];
    if (!validMimeTypes.includes(req.file.mimetype)) {
      throw new Error((value,{req})=>req.__("ADVOCATE_ID_REQUIRE"));
    }
    return true;
  }),
  oneOf(
    [
      body("issue")
        .notEmpty()
        .withMessage((value,{ req}) =>req.__("ADVOCATE_ISSUE_REQUIRED_MESSAGE")),
      body("campaign")
        .notEmpty()
        .withMessage((value,{ req}) =>req.__("ADVOCATE_CAMPAIGN_REQUIRED_MESSAGE")),
      body("advocateUser")
        .notEmpty()
        .withMessage((value,{ req}) =>req.__("ADVOCATE_USER_REQUIRED_MESSAGE")),
    ],
    (value,{ req }) => req.__("ADVOCATE_AT_LEAST_ONE_REQUIRED")
  ),
  // body("location")
  //   .notEmpty()
  //   .withMessage("Location is required")
  //   .trim() // Trim whitespace characters
  //   .custom((location) => {
  //     try {
  //       const locationObj = JSON.parse(location);
  //       if (
  //         typeof locationObj !== "object" ||
  //         !locationObj.hasOwnProperty("type") ||
  //         !locationObj.hasOwnProperty("coordinates")
  //       ) {
  //         throw new Error("Invalid location format");
  //       }
  //       if (locationObj.type !== "Point") {
  //         throw new Error("Invalid location type");
  //       }
  //       if (
  //         !Array.isArray(locationObj.coordinates) ||
  //         locationObj.coordinates.length !== 2
  //       ) {
  //         throw new Error("Invalid coordinates format");
  //       }
  //       const [longitude, latitude] = locationObj.coordinates;
  //       if (typeof longitude !== "number" || typeof latitude !== "number") {
  //         throw new Error("Coordinates must be numbers");
  //       }
  //       return true;
  //     } catch (error) {
  //       throw new Error("Invalid location format");
  //     }
  //   }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 	 res.__("VALIDATION_ERROR"),
        errors: errors.array(),
      });
    }
    return next(); // Added return statement here
  },
];

module.exports = validateAdvocate;
