const { param, validationResult } = require("express-validator");
const validateIssueId = [
    param('id')
    .notEmpty()
    .withMessage('Issue ID is required')
    .isMongoId()
    .withMessage('Issue ID must be a valid MongoDB ID'),
      (req, res, next) => {
      const errors = validationResult(req);
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
  module.exports = validateIssueId;
