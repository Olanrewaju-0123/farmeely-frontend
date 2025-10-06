const {
  createUserValidation,
  updateUserValidation,
  forgotPasswordValidation,
  createGroupValidation,
  createLivestockValidation,
  joinGroupValidation,
  resetPasswordValidation,
  resendOtpValidation,
} = require("../validations/userValidation");

/**
 * Validation middleware factory
 * @param {Function} validationFunction - The validation function to use
 * @returns {Function} Express middleware function
 */
const validate = (validationFunction) => {
  return (req, res, next) => {
    const { error } = validationFunction(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    next();
  };
};

/**
 * Validation middleware for URL parameters
 * @param {Function} validationFunction - The validation function to use
 * @returns {Function} Express middleware function
 */
const validateParams = (validationFunction) => {
  return (req, res, next) => {
    const { error } = validationFunction(req.params);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    next();
  };
};

module.exports = {
  validate,
  validateParams,
  // Specific validation middlewares
  validateCreateUser: validate(createUserValidation),
  validateUpdateUser: validate(updateUserValidation),
  validateForgotPassword: validate(forgotPasswordValidation),
  validateCreateGroup: validate(createGroupValidation),
  validateCreateLivestock: validate(createLivestockValidation),
  validateJoinGroup: validate(joinGroupValidation),
  validateResetPassword: validate(resetPasswordValidation),
  validateResendOtp: validate(resendOtpValidation),
};

