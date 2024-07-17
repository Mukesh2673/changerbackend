const { body,validationResult } = require('express-validator');

const validateIssue = [
  body('title')
    .notEmpty()
    .withMessage((value, { req}) =>req.__("TITLE_REQUIRED"))
    .isString()
    .withMessage((value, { req}) =>req.__("TITLE_MUST_NON_EMPTY")),
  body('cause')
    .notEmpty()
    .withMessage((value, { req }) => req.__('CAUSE_REQUIRED'))
    .isString()
    .withMessage((value, { req }) => req.__('CAUSE_MUST_BE_STRING')),
  body('address')
    .notEmpty()
    .withMessage((value, { req }) => req.__('ADDRESS_REQUIRED'))
    .isString()
    .withMessage((value, { req }) => req.__('ADDRESS_MUST_BE_STRING')),
  body('image')
    .notEmpty()
    .withMessage((value, { req }) => req.__('IMAGE_REQUIRED'))
    .isString()
    .withMessage((value, { req }) => req.__('IMAGE_MUST_BE_STRING')),
  body('video')
  .notEmpty()
  .withMessage((value, { req }) => req.__('VIDEO_REQUIRED'))
  .isObject()
  .withMessage((value, { req }) => req.__('VIDEO_MUST_BE_OBJECT')),
body('video.videoUrl')
  .notEmpty()
  .withMessage((value, { req }) => req.__('VIDEO_URL_REQUIRED'))
  .isString()
  .withMessage((value, { req }) => req.__('VIDEO_URL_MUST_BE_STRING')),
body('video.type')
  .notEmpty()
  .withMessage((value, { req }) => req.__('VIDEO_TYPE_REQUIRED'))
  .isString()
  .withMessage((value, { req }) => req.__('VIDEO_TYPE_MUST_BE_STRING')),
body('video.thumbnailUrl')
  .notEmpty()
  .withMessage((value, { req }) => req.__('VIDEO_THUMBNAIL_URL_REQUIRED'))
  .isString()
  .withMessage((value, { req }) => req.__('VIDEO_THUMBNAIL_URL_MUST_BE_STRING')),
body('description')
  .notEmpty()
  .withMessage((value, { req }) => req.__('DESCRIPTION_REQUIRED'))
  .isString()
  .withMessage((value, { req }) => req.__('DESCRIPTION_MUST_BE_STRING')),
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

module.exports = validateIssue;
