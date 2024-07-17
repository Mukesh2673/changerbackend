const { body, validationResult }=require('express-validator');
const validateSignupRequest = [
  body('email')
    .notEmpty()
    .withMessage((value,{ req}) =>req.__("EMAIL_REQUIRED"))
    .isEmail()
    .withMessage((value,{ req}) =>req.__("INVALID_EMAIL_FORMAT")),
  body('password')
    .notEmpty()
    .withMessage((value,{ req}) =>req.__("PASSWORD_REQUIRED"))
    .isLength({ min: 8 })
    .withMessage(({ req}) =>req.__("PASSWORD_MUST_BE_8_CHAR"))
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
    .withMessage((value,{ req}) =>req.__("PASSWORD_LETTER_NUMBER_COMBINATION")),
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

module.exports= validateSignupRequest;
