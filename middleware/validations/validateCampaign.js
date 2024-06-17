const { body, validationResult, oneOf } = require("express-validator");
const petitionValidators = require('./validateCampaignPetitions');
const donationValidators = require('./validateCampaignDonation');

const isValidObjectId = (value) => {
  return /^[0-9a-fA-F]{24}$/.test(value);
};

const validateRecords = [
  // Validate root level fields
  body("user")
    .notEmpty().withMessage("User ID is required")
    .custom(isValidObjectId).withMessage("Invalid User ID format"),
  
  body("title")
    .notEmpty().withMessage("Title is required")
    .isString().withMessage("Title must be a string"),
  
  body("cause")
    .notEmpty().withMessage("Cause is required")
    .isString().withMessage("Cause must be a string"),

  body("story")
    .optional()
    .isString().withMessage("Story must be a string"),

  body("image")
    .notEmpty().withMessage("Image URL is required")
    .isString().withMessage("Invalid Image URL"),

  body("video.videoUrl")
    .notEmpty().withMessage("Video URL is required"),

  body("video.type")
    .notEmpty().withMessage("Video type is required"),

  body("video.thumbnailUrl")
    .notEmpty().withMessage("Thumbnail URL is required"),

  // Validate phase array
  body("phase")
    .isArray({ min: 1 }).withMessage("Phase must be a non-empty array"),
     body("phase.*.title")
    .notEmpty().withMessage("Phase title is required")
    .isString().withMessage("Phase title must be a string"),

    body('phase.*.action')
    .isArray({ min: 1 }).withMessage('Action must be a non-empty array')
    .custom((actions) => {
      const actionNames = actions.map(action => action.name);

      if (actionNames.filter(name => name === 'donation').length > 1) {
        throw new Error('Only one donation action is allowed per phase');
      }
      if (actionNames.filter(name => name === 'petition').length > 1) {
        throw new Error('Only one petition action is allowed per phase');
      }
      return true;
    }),
   
    body('phase.*.action.*').custom(async (action, { req }) => {
        if (action.name === 'donation') {
          const donationErrors = await Promise.all(donationValidators.map(validator => validator.run(req)));
    
          const errors = donationErrors.reduce((acc, validationResult) => {
            if (!validationResult.isEmpty()) {
              acc.push(...validationResult.array());
            }
            return acc;
          }, []);
    
          if (errors.length > 0) {
            throw new Error(errors.map(error => error.msg).join(', '));
          }
        } else if (action.name === 'petition') {
          const petitionErrors = await Promise.all(petitionValidators.map(validator => validator.run(req)));
    
          const errors = petitionErrors.reduce((acc, validationResult) => {
            if (!validationResult.isEmpty()) {
              acc.push(...validationResult.array());
            }
            return acc;
          }, []);
    
          if (errors.length > 0) {
            throw new Error(errors.map(error => error.msg).join(', '));
          }
        }
        return true;
      }),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array()
      });
    }
    next();
  },
];

module.exports = validateRecords;
