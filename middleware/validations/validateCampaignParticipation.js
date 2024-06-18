const { body } = require('express-validator');

// Validators for donation action
const donationValidators = [
    body('participant')
    .isNumeric().withMessage('Numbers of participant must be a number')
    .isFloat({ min: 0 }).withMessage('Numbers of participant must be a non-negative integer'),

  body('roleTitle')
    .notEmpty().withMessage('Participant role title is required')
    .isString().withMessage('Participant role title must be a string'),

  body('description')
    .notEmpty().withMessage('Participant description is required')
    .isString().withMessage('Participant Description must be a string'),

  // body('workplaceType')
  //   .notEmpty().withMessage('Participant Workplace type is required')
  //   .isString().withMessage('Participant Workplace type must be a string'),

  // body('location.type')
  //   .equals('Point').withMessage('Location type must be "Point"'),

  // body('location.coordinates')
  //   .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of two numbers'),

  // body('location.coordinates.*')
  //   .isFloat().withMessage('Coordinates must be numbers'),

  // body('startDate')
  //   .notEmpty().withMessage('Participant start date is required'),

  body('numberofDays')
  .isNumeric().withMessage('Participant numbers of days must be a number')
  .isFloat({ min: 0 }).withMessage('Participant  number of days must be a non-negative integer'),

  // body('Time.partTime')
  //   .isBoolean().withMessage('Part time must be a boolean'),

  // body('Time.fullTime')
  //   .isBoolean().withMessage('Full time must be a boolean'),

  // Validate responsibilities array
  // body('responsibilities')
  //   .isArray({ min: 1 }).withMessage('Responsibilities must be a non-empty array'),

  // body('responsibilities.*.responsibility')
  //   .notEmpty().withMessage('Responsibility cannot be empty')
  //   .isString().withMessage('Responsibility must be a string'),

  // Validate skills array
  // body('skills')
  //   .isArray({ min: 1 }).withMessage('Skills must be a non-empty array'),

  // body('skills.*.skill')
  //   .notEmpty().withMessage('Skill cannot be empty')
  //   .isString().withMessage('Skill must be a string'),

  // Validate requirements array
  // body('requirements')
  //   .isArray({ min: 1 }).withMessage('Requirements must be a non-empty array'),

  // body('requirements.*.requirement')
  //   .notEmpty().withMessage('Requirement cannot be empty')
  //   .isString().withMessage('Requirement must be a string'),

  // Validate provides array
  // body('provides')
  //   .isArray({ min: 1 }).withMessage('Provides must be a non-empty array'),

  // body('provides.*.provide')
  //   .notEmpty().withMessage('Provide cannot be empty')
  //   .isString().withMessage('Provide must be a string'),

  body('karmaPoint')
    .isNumeric().withMessage('Karma point must be a number')
    .isFloat({ min: 0 }).withMessage('Karma Point must be a non-negative integer'),
  ];

module.exports = donationValidators;
