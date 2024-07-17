const { body,param, validationResult } = require("express-validator");
const validateCampaignMessages = [
    param('campaignId')
    .notEmpty()
    .withMessage('Campaign ID is required')
    .isMongoId()
    .withMessage('Campaign ID must be a valid MongoDB ID'),
    body("profile")
      .notEmpty()
      .withMessage("User Id  are required to send messages")
      .bail()
      .isMongoId()
      .withMessage("Profile must be a valid MongoDB ID"),
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
  module.exports = validateCampaignMessages;
