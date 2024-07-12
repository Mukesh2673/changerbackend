const { body, validationResult, oneOf } = require("express-validator");
const validateBookMarks = [
  oneOf(
    [
      body("issue")
        .notEmpty()
        .withMessage("Either issue, or campaign must be provided")
        .bail()
        .isMongoId()
        .withMessage("Issue must be a valid MongoDB ID"),
      body("campaign")
        .notEmpty()
        .withMessage("Either issue, or campaign must be provided")
        .bail()
        .isMongoId()
        .withMessage("Issue must be a valid MongoDB ID"),
    ],
    "At least one of issue, or campaign must be provided"
  ),
  (req, res, next) => {
    const errors = validationResult(req);
    const { issue, campaign } = req.body;
    for (const error of errors.array()) {
      if (error.nestedErrors && error.type === "alternative_grouped") {
        for (const nestedError of error.nestedErrors) {
          if (campaign) {
            // Find the error object with path "campaign"
            const campaignError = nestedError.find(
              (err) => err.path === "campaign"
            );
            if (campaignError) {
              // Attach campaignError to the error object and remove nestedErrors
              error.campaignError = campaignError;
              delete error.nestedErrors;
            }
          }
          if (issue) {
            // Find the error object with path "campaign"
            const issueError = nestedError.find((err) => err.path === "issue");
            if (issueError) {
              // Attach campaignError to the error object and remove nestedErrors
              error.issueError = issueError;
              delete error.nestedErrors;
            }
          }
        }
      }
    }
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
