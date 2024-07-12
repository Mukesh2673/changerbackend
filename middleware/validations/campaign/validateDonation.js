const { body,param, validationResult, oneOf } = require("express-validator");
const validateDonation = [
    param('donationId')
    .notEmpty()
    .withMessage('Donation ID is required')
    .isMongoId()
    .withMessage('Donation ID must be a valid MongoDB ID'),
    body("amount")
      .notEmpty()
      .withMessage('Amount are Required')
      .isNumeric()
      .withMessage(`Amount must be a number`),
    body("source")
      .notEmpty()
      .withMessage("Source token are required")
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
  module.exports = validateDonation;
