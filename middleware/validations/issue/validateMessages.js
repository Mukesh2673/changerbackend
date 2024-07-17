const { body, validationResult } = require("express-validator");
const validateIssueMessages = [
    body("issueId")
      .notEmpty()
      .withMessage((value, { req}) =>req.__("ISSUE_ID_REQUIRED"))
      .bail()
      .isMongoId()
      .withMessage((value, { req}) =>req.__("INVALID_ISSUE_ID_FORMAT")),
    body("message")
      .notEmpty()
      .withMessage((value, { req}) =>req.__("MESSAGE_REQUIRED"))
      .bail(),
    (req, res, next) => {
      const errors = validationResult(req);
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
  module.exports = validateIssueMessages;
