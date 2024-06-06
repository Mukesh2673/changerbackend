const { body, validationResult, oneOf } = require("express-validator");
const validateBookMarks = [
  oneOf(
    [
      body("issue")
        .notEmpty()
        .withMessage("Issue is required if campaign  are not provided"),
      body("campaign")
        .notEmpty()
        .withMessage("Campaign is required if issue  not provided"),
    ],
    "At least one of issue, or campaign must be provided"
  ),
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

module.exports = validateBookMarks;
