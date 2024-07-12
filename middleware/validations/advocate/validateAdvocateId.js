const { param, validationResult } = require("express-validator");
const validateCampaignId = [
    param('id')
    .notEmpty()
    .withMessage('Advocate ID is required')
    .isMongoId()
    .withMessage('Advocate ID must be a valid MongoDB ID'),
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
  module.exports = validateCampaignId;
