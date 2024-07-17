const { body, validationResult, oneOf } = require("express-validator");
const i18n = require("i18n"); // Ensure i18n is properly configured and required

const validateBooleanObject = (timeObject, fieldName, req) => {
  if (!timeObject || typeof timeObject !== "object") {
    let message=`${fieldName}_FIELD_MUST_BE_OBJECT` 
    throw new Error(message);
  } else {
    if (typeof timeObject.status !== "boolean") {
      let message=`${fieldName}_FIELD_STATUS_MUST_BE_BOOLEAN` 
      throw new Error(message);
    }
    if (!timeObject.details || typeof timeObject.details !== "string") {      
      let message=`${fieldName}_FIELD_DETAILS_MUST_BE_STRING`
      throw new Error(message);
    }
  }
};
const validateArrayField = (field, fieldName, req) => {
  if (!field || !Array.isArray(field) || field.length === 0) {
   let message=`${fieldName}_FIELD_MUST_BE_NON_EMPTY_ARRAY` 
    throw new Error(message);
  }
  field.forEach((item, index) => {
    if (!item.name || typeof item.name !== "string" || item.name.trim() === "") {
      let message=`${fieldName}_FIELD_NAME_MUST_BE_NON_EMPTY_STRING`
      throw new Error(message);
    }
  });
};

const validateDonationAction = (action, req) => {
  if (action.name === "donation") {
    if (!action.amount || typeof action.amount !== "number" || action.amount < 0) {
      throw new Error(req.__("DONATION_AMOUNT_MUST_BE_NON_NEGATIVE"));
    }
    if (!action.description || typeof action.description !== "string") {
      throw new Error(req.__("DONATION_DESCRIPTION_MUST_BE_STRING"));
    }
    if (!action.karmaUnit || typeof action.karmaUnit !== "number") {
      throw new Error(req.__("KARMA_UNIT_MUST_BE_NON_NEGATIVE"));
    }
    if (!action.karmaPoint || typeof action.karmaPoint !== "number" || action.karmaPoint < 0) {
      throw new Error(req.__("DONATION_KARMA_POINT_MUST_BE_NON_NEGATIVE"));
    }
  }
  return true;
};

const validatePetitions = (action, req) => {
  if (action.name === "petition") {
    if (!action.numberOfSignature || typeof action.numberOfSignature !== "number" || action.numberOfSignature < 0) {
      throw new Error(req.__("SIGNATURES_MUST_BE_NON_NEGATIVE"));
    }
    if (!action.neededSignaturesFor || typeof action.neededSignaturesFor !== "string") {
      throw new Error(req.__("NEEDED_SIGNATURES_DESCRIPTION_MUST_BE_STRING"));
    }
    if (!action.karmaPoint || typeof action.karmaPoint !== "number" || action.karmaPoint < 0) {
      throw new Error(req.__("SIGNATURES_KARMA_POINT_MUST_BE_NON_NEGATIVE"));
    }
  }
  return true;
};

const validateParticipationAction = (action, req) => {
  if (action.name === "participation") {
    if (!action.participant || typeof action.participant !== "number" || action.participant <= 0) {
      throw new Error(req.__("PARTICIPANTS_MUST_BE_POSITIVE"));
    }
    if (!action.startDate || typeof action.startDate !== "string") {
      throw new Error(req.__("START_DATE_MUST_BE_STRING"));
    }
    if (!action.numberOfDays || typeof action.numberOfDays !== "number" || action.numberOfDays < 0) {
      throw new Error(req.__("NUMBER_OF_DAYS_MUST_BE_NON_NEGATIVE"));
    }
    if (!action.roleTitle || typeof action.roleTitle !== "string") {
      throw new Error(req.__("ROLE_TITLE_MUST_BE_NON_EMPTY_STRING"));
    }
    if (!action.description || typeof action.description !== "string") {
      throw new Error(req.__("DESCRIPTION_REQUIRED"));
    }
    if (!action.address || typeof action.address !== "string") {
      throw new Error(req.__("ADDRESS_MUST_BE_STRING"));
    }
    // Validate location
    if (!action.location || typeof action.location !== "object") {
      throw new Error(req.__("LOCATION_MUST_BE_OBJECT"));
    }
    if (action.location.type !== "Point") {
      throw new Error(req.__("LOCATION_TYPE_MUST_BE_POINT"));
    }
    if (!Array.isArray(action.location.coordinates) || action.location.coordinates.length !== 2) {
      throw new Error(req.__("LOCATION_COORDINATES_MUST_BE_ARRAY"));
    }
    const [latitude, longitude] = action.location.coordinates;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      throw new Error(req.__("LOCATION_COORDINATES_MUST_BE_NUMBERS"));
    }
    if (latitude < -90 || latitude > 90) {
      throw new Error(req.__("LATITUDE_RANGE"));
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error(req.__("LONGITUDE_RANGE"));
    }
    if (action.skills.length === 0) {
      throw new Error(req.__("SKILLS_NON_EMPTY_ARRAY"));
    }
    validateArrayField(action.requirements, "REQUIREMENTS", req);
    validateArrayField(action.provides, "PROVIDES", req);
    validateArrayField(action.responsibilities, "RESPONSIBILITIES", req);
    validateBooleanObject(action.partTime, "PART_TIME", req);
    validateBooleanObject(action.fullTime, req.__("FULL_TIME"), req);
    validateBooleanObject(action.onSite, "ON_SITE", req);
    validateBooleanObject(action.remote, "REMOTE", req);
  }
  return true;
};

const validateRecords = [
  // Validate root level fields
  body("title")
    .notEmpty()
    .withMessage((value, { req }) => req.__("TITLE_REQUIRED"))
    .isString()
    .withMessage((value, { req }) => req.__("TITLE_MUST_BE_STRING")),
  body("cause")
    .notEmpty()
    .withMessage((value, { req }) => req.__("CAUSE_REQUIRED"))
    .isString()
    .withMessage((value, { req }) => req.__("CAUSE_MUST_BE_STRING")),
  body("story")
    .notEmpty()
    .withMessage((value, { req }) => req.__("STORY_MUST_BE_STRING")),
  body("image")
    .notEmpty()
    .withMessage((value, { req }) => req.__("IMAGE_URL_REQUIRED"))
    .isString()
    .withMessage((value, { req }) => req.__("INVALID_IMAGE_URL")),
  body("video.videoUrl")
    .notEmpty()
    .withMessage((value, { req }) => req.__("VIDEO_URL_REQUIRED")),
  body("video.type")
    .notEmpty()
    .withMessage((value, { req }) => req.__("VIDEO_TYPE_REQUIRED")),
  body("video.thumbnailUrl")
    .notEmpty()
    .withMessage((value, { req }) => req.__("THUMBNAIL_URL_REQUIRED")),
  // Validate phase array
  body("phase")
    .isArray({ min: 1 })
    .withMessage((value, { req }) => req.__("PHASE_MUST_BE_NON_EMPTY_ARRAY")),
  body("phase.*.title")
    .notEmpty()
    .withMessage((value, { req }) => req.__("PHASE_TITLE_REQUIRED"))
    .isString()
    .withMessage((value, { req }) => req.__("PHASE_TITLE_MUST_BE_STRING")),
  body("phase.*.action")
    .isArray({ min: 1 })
    .withMessage((value, { req }) => req.__("ACTION_MUST_BE_NON_EMPTY_ARRAY"))
    .custom((actions, { req }) => {
      const actionNames = actions.map((action) => action.name);
      if (actionNames.filter((name) => name === "donation").length > 1) {
        throw new Error(req.__("ONLY_ONE_DONATION_ACTION"));
      }
      if (actionNames.filter((name) => name === "petition").length > 1) {
        throw new Error(req.__("ONLY_ONE_PETITION_ACTION"));
      }
      return true;
    }),
  body("phase.*.action.*").custom((action, { req }) => {
    if (action.name === "donation") {
      validateDonationAction(action, req);
    } else if (action.name === "petition") {
      validatePetitions(action, req);
    } else if (action.name === "participation") {
      validateParticipationAction(action, req);
    }
    return true;
  }),
  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: req.__("VALIDATION_ERROR"),
        errors: errors.array().map((error) => req.__(error.msg)),
      });
    }
    next();
  },
];

module.exports = validateRecords;
