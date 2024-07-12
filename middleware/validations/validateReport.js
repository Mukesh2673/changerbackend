const { body, validationResult, oneOf } = require("express-validator");
const validateReport = [
  oneOf(
    [
      body("issue")
        .notEmpty()
        .withMessage("Either issue, campaign, or profile must be provided")
        .bail()
        .isMongoId()
        .withMessage("Issue must be a valid MongoDB ID"),
      body("campaign")
        .notEmpty()
        .withMessage("Either issue, campaign, or profile must be provided")
        .bail()
        .isMongoId()
        .withMessage("Campaign must be a valid MongoDB ID"),
      body("profile")
        .notEmpty()
        .withMessage("Either issue, campaign, or profile must be provided")
        .bail()
        .isMongoId()
        .withMessage("Profile must be a valid MongoDB ID"),
    ],
    "At least one of issue, profile, campaign must be provided"
  ),
  body("details")
    .notEmpty()
    .withMessage("Details are required")
    .bail()
    .isString()
    .withMessage("Details must be a string"),
  body("reportSubject")
    .notEmpty()
    .withMessage("Report subject are required")
    .bail()
    .isString()
    .withMessage("Report subject must be a string"),
  (req, res, next) => {
    const errors = validationResult(req);
    const { profile, campaign, issue } = req.body;
    for (const error of errors.array()) {
      if (error.nestedErrors && error.type === "alternative_grouped") {
        for (const nestedError of error.nestedErrors) {
          if (profile) {
            // Find the error object with path "profile"
            const profileError = nestedError.find(
              (err) => err.path === "profile"
            );
            if (profileError) {
              // Attach profileError to the error object and remove nestedErrors
              error.profileError = profileError;
              delete error.nestedErrors;
            }
          }
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
    return next();
  },
];

module.exports = validateReport;
