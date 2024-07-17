const { body, validationResult, oneOf } = require("express-validator");
const validateReport = [
  oneOf(
    [
      body("issue")
        .notEmpty()
        .withMessage((value,{ req}) =>req.__("REPORT_REQUIRED_MESSAGE"))
        .bail()
        .isMongoId()
        .withMessage((value,{ req}) =>req.__("INVALID_ISSUE_ID_FORMAT")),
      body("campaign")
        .notEmpty()
        .withMessage((value,{ req}) =>req.__("REPORT_REQUIRED_MESSAGE"))
        .bail()
        .isMongoId()
        .withMessage((value,{ req}) =>req.__("CAMPAIGN_ID_MUST_BE_VALID")),
      body("profile")
        .notEmpty()
        .withMessage((value,{ req}) =>req.__("REPORT_REQUIRED_MESSAGE"))
        .bail()
        .isMongoId()
        .withMessage((value,{ req}) =>req.__("INVALID_USER_ID_FORMAT")),
    ],
    (value,{ req }) => req.__("REPORT_AT_LEAST_ONE_REQUIRED")
  ),
  body("details")
    .notEmpty()
    .withMessage((value,{ req}) =>req.__("DETAILS_REQUIRED"))
    .bail()
    .isString()
    .withMessage((value,{ req}) =>req.__("DETAILS_MUST_STRING")),
  body("reportSubject")
    .notEmpty()
    .withMessage((value,{ req}) =>req.__("REPORT_SUBJECT_REQUIRED"))
    .bail()
    .isString()
    .withMessage((value,{ req}) =>req.__("REPORT_SUBJECT_MUST_BE_STRING")),
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
        message: res.__("VALIDATION_ERROR"),
        errors: errors.array(),
      });
    }
    return next();
  },
];

module.exports = validateReport;
