const { param,body, validationResult } = require("express-validator");
const validateUpdateIssue = [
    param('id')
    .notEmpty()
    .withMessage((value, { req}) =>req.__("ISSUE_ID_REQUIRED"))
    .isMongoId()
    .withMessage((value, { req}) =>req.__("INVALID_ISSUE_ID_FORMAT")),
    body("description")
    .notEmpty()
    .withMessage((value,{ req}) =>req.__("DESCRIPTION_REQUIRED")),
    body("notification")
    .notEmpty()
    .withMessage((value,{ req}) =>req.__("NOTIFICATION_REQUIRED")),
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
  module.exports = validateUpdateIssue;
