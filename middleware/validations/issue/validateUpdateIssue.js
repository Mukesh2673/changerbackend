const { param,body, validationResult } = require("express-validator");
const validateUpdateIssue = [
    param('id')
    .notEmpty()
    .withMessage('Issue ID is required')
    .isMongoId()
    .withMessage('Issue ID must be a valid MongoDB ID'),
    body("description")
    .notEmpty()
    .withMessage("description  are required"),
    body("notification")
    .notEmpty()
    .withMessage("Notification  are required"),
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
  module.exports = validateUpdateIssue;
