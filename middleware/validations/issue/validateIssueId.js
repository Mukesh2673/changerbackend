const { param, validationResult } = require("express-validator");
const validateIssueId = [
    param('id')
    .notEmpty()
    .isMongoId()
    .withMessage((value,{ req}) =>req.__("INVALID_ISSUE_ID_FORMAT")),
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
  module.exports = validateIssueId;
