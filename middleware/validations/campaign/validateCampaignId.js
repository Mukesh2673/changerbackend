const { param, validationResult } = require("express-validator");
const validateAdvocateId = [
    param('campaignId')
    .notEmpty()
    .withMessage((value, { req}) =>req.__("CAMPAIGN_ID_REQUIRED"))
    .isMongoId()
    .withMessage((value, { req}) =>req.__("CAMPAIGN_ID_MUST_BE_VALID")),
      (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message:res.__("VALIDATION_ERROR"),
          errors: errors.array(),
        });
      }
      return next();
    },
  ];
  module.exports = validateAdvocateId;
