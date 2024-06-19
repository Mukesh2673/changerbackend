const { body, validationResult, oneOf } = require("express-validator");

const validateBooleanObject = (timeObject, fieldName) => {
  if (!timeObject || typeof timeObject !== "object") {
    throw new Error(`${fieldName} must be an object and required`);
  } else {
    if (typeof timeObject.status !== "boolean") {
      throw new Error(`${fieldName} status must be a boolean`);
    }
    if (!timeObject.details || typeof timeObject.details !== "string") {
      throw new Error(`${fieldName} details must be a string`);
    }
  }
};

const validateArrayField = (field, fieldName) => {
  if (!field || !Array.isArray(field) || field.length === 0) {
    throw new Error(`${fieldName} must be a non-empty array`);
  }
  field.forEach((item, index) => {
    if (
      !item.name ||
      typeof item.name !== "string" ||
      item.name.trim() === ""
    ) {
      throw new Error(
        `${fieldName} name at ${index + 1} position must be a non-empty string`
      );
    }
  });
};

const validateDonationAction = (action) => {
  if (action.name === "donation") {
    if (
      !action.amount ||
      typeof action.amount !== "number" ||
      action.amount < 0
    ) {
      throw new Error("Donation amount must be a non-negative number");
    }
    if (!action.description || typeof action.description !== "string") {
      throw new Error("Donation description must be a string");
    }
    if (!action.karmaUnit || typeof action.karmaUnit !== "string") {
      throw new Error("karmaUnit must be a required string");
    }
    if (
      !action.karmaPoint ||
      typeof action.karmaPoint !== "number" ||
      action.karmaPoint < 0
    ) {
      throw new Error("Donation KarmaPoint must be a non-negative number");
    }
  }
  return true;
};

const validatePetitions = (action) => {
  if (action.name === "petition") {
    if (
      !action.numberOfSignature ||
      typeof action.numberOfSignature !== "number" ||
      action.numberOfSignature < 0
    ) {
      throw new Error(
        "Number of Signatures to petitions must be a non-negative number"
      );
    }
    if (!action.neededSignaturesFor || typeof action.neededSignaturesFor !== "string") {
      throw new Error("Description about Need of Signature must be a string");
    }
    if (
      !action.karmaPoint ||
      typeof action.karmaPoint !== "number" ||
      action.karmaPoint < 0
    ) {
      throw new Error(
        "KarmaPoint earn by every Signatureust be a non-negative number"
      );
    }
  }
  return true;
};

const validateParticipationAction = (action) => {
  if (action.name === "participation") {
    if (
      !action.participant ||
      typeof action.participant !== "number" ||
      action.participant <= 0
    ) {
      throw new Error("The number of participants must be a positive number.");
    }
    if (!action.startDate || typeof action.startDate !== "string") {
      throw new Error("The start date must be a valid string.");
    }

    if(
      !action.numberOfDays ||
      typeof action.numberOfDays !== "number" ||
      action.numberOfDays < 0
    ) {
      throw new Error("Participant Number of Days must be a non-negative number");
    }

    if (!action.roleTitle || typeof action.roleTitle !== "string") {
      throw new Error("The role title must be a non-empty string.");
    }
    if (!action.description || typeof action.description !== "string") {
      throw new Error(
        "The description of the need for participants is required."
      );
    }
    if (!action.address || typeof action.address !== "string") {
      throw new Error("The Address must be a valid string.");
    }
    // Validate location
    if (!action.location || typeof action.location !== "object") {
      throw new Error("Location must be an object and is required.");
    }
    if (action.location.type !== "Point") {
      throw new Error('Location type must be "Point".');
    }
    if (
      !Array.isArray(action.location.coordinates) ||
      action.location.coordinates.length !== 2
    ) {
      throw new Error("Location coordinates must be an array of two numbers.");
    }
    const [latitude, longitude] = action.location.coordinates;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      throw new Error("Location coordinates must be numbers.");
    }
    if (latitude < -90 || latitude > 90) {
      throw new Error("Latitude must be between -90 and 90.");
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error("Longitude must be between -180 and 180.");
    }
    if (action.skills.length==0) {
      throw new Error("Skills should be non empty array");
    }
    validateArrayField(action.requirements, "Requirements");
    validateArrayField(action.provides, "Provide");
    validateArrayField(action.responsibilities, "Responsibilities");
    validateBooleanObject(action.partTime, "Participation partTime");
    validateBooleanObject(action.fullTime, "Participation fullTime");
    validateBooleanObject(action.onSite, "Participation onSite");
    validateBooleanObject(action.remote, "Participation Remote");
  }
  return true;
};

const validateRecords = [
  // Validate root level fields

  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string"),

  body("cause")
    .notEmpty()
    .withMessage("Cause is required")
    .isString()
    .withMessage("Cause must be a string"),

  body("story").notEmpty().isString().withMessage("Story must be a string"),

  body("image")
    .notEmpty()
    .withMessage("Image URL is required")
    .isString()
    .withMessage("Invalid Image URL"),

  body("video.videoUrl").notEmpty().withMessage("Video URL is required"),

  body("video.type").notEmpty().withMessage("Video type is required"),

  body("video.thumbnailUrl")
    .notEmpty()
    .withMessage("Thumbnail URL is required"),

  // Validate phase array
  body("phase")
    .isArray({ min: 1 })
    .withMessage("Phase must be a non-empty array"),
  body("phase.*.title")
    .notEmpty()
    .withMessage("Phase title is required")
    .isString()
    .withMessage("Phase title must be a string"),

  body("phase.*.action")
    .isArray({ min: 1 })
    .withMessage("Action must be a non-empty array")
    .custom((actions) => {
      const actionNames = actions.map((action) => action.name);

      if (actionNames.filter((name) => name === "donation").length > 1) {
        throw new Error("Only one donation action is allowed per phase");
      }
      if (actionNames.filter((name) => name === "petition").length > 1) {
        throw new Error("Only one petition action is allowed per phase");
      }
      return true;
    }),

  body("phase.*.action.*").custom(async (action, { req }) => {
    if (action.name === "donation") {
      validateDonationAction(action);
    } else if (action.name === "petition") {
      validatePetitions(action);
    } else if (action.name === "participation") {
      validateParticipationAction(action);
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
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = validateRecords;
