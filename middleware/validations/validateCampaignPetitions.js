const { body } = require('express-validator');

// Validators for petition action
const petitionValidators = [
  body('signature')
  .notEmpty().withMessage('Number of Signatures is required')
  .isNumeric().withMessage('Number of Signature must be a number'),
  body('description')
    .optional()
    .isString().withMessage('Petition signature description must be a string '),

  body('karmaPoint')
    .notEmpty().withMessage('Karma points for earning per signature are required')
    .isInt({ min: 0 }).withMessage('KarmaPoint must be a non-negative integer'),
];

module.exports = {petitionValidators};
