const { body, validationResult }=require('express-validator');

const validateSignupConfirmRequest = [
  body('email')
    .notEmpty()
    .withMessage((value,{ req}) =>req.__("EMAIL_REQUIRED"))
    .isEmail()
    .withMessage((value,{ req}) =>req.__("INVALID_EMAIL_FORMAT")),
  body('code')
    .notEmpty()
    .withMessage((value,{ req}) =>req.__("CODE_IS_REQUIRED"))
    .isLength({ min: 6, max: 6 })
    .withMessage((value,{ req}) =>req.__("CODE_IS_REQUIRED")),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: res.__("VALIDATION_ERROR"),
        errors: errors.array(),
      });
    }
    return next(); // Added return statement here
  },
];

module.exports= validateSignupConfirmRequest;
