const { body,param, validationResult, oneOf } = require("express-validator");
const validateDonation = [
    param('donationId')
    .notEmpty()
    .withMessage((value,{ req}) =>req.__("DONATION_ID_REQUIRED"))
    .isMongoId()
    .withMessage((value,{ req}) =>req.__("DONATION_ID_MUST_BE_VALID")),
    body("amount")
      .notEmpty()
      .withMessage((value,{ req}) =>req.__("AMOUNT_REQUIRED"))
      .isNumeric()
      .withMessage((value,{ req}) =>req.__("AMOUNT_MUST_BE_NUMBER")),
    body("source")
      .notEmpty()
      .withMessage((value,{ req}) =>req.__("SOURCE_TOKEN_REQUIRED"))
      .bail(),
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
  module.exports = validateDonation;
