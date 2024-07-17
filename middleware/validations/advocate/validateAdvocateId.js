const { param, validationResult,req,res } = require("express-validator");
const validateCampaignId = [
    param('id')
    .notEmpty()
    .withMessage((value, { req }) =>req.__("ADVOCATE_ID_REQUIRE"))
    .isMongoId()
    .withMessage((value, { req }) =>req.__("ADVOCATE_ID_REQUIRE")),

    // .withMessage((res)=>res.__("ADVOCATE_VALID_MONGO_ID")),
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
  module.exports = validateCampaignId;
