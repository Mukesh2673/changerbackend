const { body,param, validationResult,req } = require("express-validator");
const validateCampaignMessages = [
    param('campaignId')
    .notEmpty()
    .withMessage((value,{ req }) =>req.__("CAMPAIGN_ID_REQUIRED"))
    .isMongoId()
    .withMessage((value,{ req}) =>req.__("CAMPAIGN_ID_MUST_BE_VALID")),
    body("profile")
      .notEmpty()
      .withMessage((value,{ req}) =>req.__("USER_ID_REQUIRED"))
      .bail()
      .isMongoId()
      .withMessage((value,{ req}) =>req.__("INVALID_USER_ID_FORMAT")),
    body("message")
      .notEmpty()
      .withMessage((value,{ req}) =>req.__("MESSAGE_REQUIRED"))
      .bail(),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message:  res.__("VALIDATION_ERROR"),
          errors: errors.array(),
        });
      }
      return next();
    },
  ];
  module.exports = validateCampaignMessages;
