const { body,validationResult } = require('express-validator');

const validateIssue = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string'),
  body('cause')
    .notEmpty()
    .withMessage('Cause is required')
    .isString()
    .withMessage('Cause must be a string'),
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isString()
    .withMessage('Address must be a string'),
  body('image')
    .notEmpty()
    .withMessage('Image is required')
    .isString()
    .withMessage('Image must be a string'),
  body('video')
    .notEmpty()
    .withMessage('Video is required')
    .isObject()
    .withMessage('Video must be an object'),
  body('video.videoUrl')
    .notEmpty()
    .withMessage('Video URL is required')
    .isString()
    .withMessage('Video URL must be a string'),
  body('video.type')
    .notEmpty()
    .withMessage('Video type is required')
    .isString()
    .withMessage('Video type must be a string'),
  body('video.thumbnailUrl')
    .notEmpty()
    .withMessage('Video thumbnail URL is required')
    .isString()
    .withMessage('Video thumbnail URL must be a string'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string'),
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

module.exports = validateIssue;
