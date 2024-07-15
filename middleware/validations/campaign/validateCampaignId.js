const { param, validationResult } = require("express-validator");
const validateAdvocateId = [
    param('campaignId')
    .notEmpty()
    .withMessage('Campaign ID is required')
    .isMongoId()
    .withMessage('Campaign ID must be a valid MongoDB ID'),
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
  module.exports = validateAdvocateId;
