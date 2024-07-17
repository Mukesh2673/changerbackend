const { body, validationResult }=require('express-validator');

const validateSigninRequest = [
  body('email')
    .notEmpty()
    .withMessage((value,{ req}) =>req.__("EMAIL_REQUIRED"))
    .isEmail()
    .withMessage((value,{ req}) =>req.__("INVALID_EMAIL_FORMAT")),
  body('password')
    .notEmpty()
    .withMessage((value,{ req}) =>req.__("PASSWORD_REQUIRED"))
    .isLength({ min: 8 })
    .withMessage((value,{ req}) =>req.__("PASSWORD_MUST_BE_8_CHAR")),

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

module.exports= validateSigninRequest;
