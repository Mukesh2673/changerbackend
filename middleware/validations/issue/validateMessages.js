const { body, validationResult } = require("express-validator");
const validateIssueMessages = [
    body("issueId")
      .notEmpty()
      .withMessage("Issue id  are required to send messages")
      .bail()
      .isMongoId()
      .withMessage("Issue id must be a valid MongoDB ID"),
    body("message")
      .notEmpty()
      .withMessage("Message  are required")
      .bail(),
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
  module.exports = validateIssueMessages;
