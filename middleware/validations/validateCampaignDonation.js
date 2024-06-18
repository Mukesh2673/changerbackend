const { body } = require('express-validator');

// Validators for donation action
const donationValidators = [
  body('amount')
    .notEmpty().withMessage('Donation amount is required')
    .isNumeric().withMessage('Donation amount must be a number')
    .isFloat({ min: 0 }).withMessage('Donation amount must be a non-negative number'),

  body('description')
  .notEmpty().withMessage('Donation description is required')
  .isString().withMessage('Donation description must be a string'),

  body('karmaPoint')
  .notEmpty().withMessage('Karma points for earning per $10 donation are required')
   .isInt({ min: 0 }).withMessage('Donation KarmaPoint must be a non-negative integer'),
];

module.exports = {donationValidators};
