const Joi = require("joi");

const createUserValidation = (user) => {
  const schema = Joi.object({
    surname: Joi.string().min(2).max(50).required(),
    othernames: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$"
        )
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
        "string.min": "Password must be at least 8 characters long",
      }),
    phoneNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required(),
    location: Joi.string().min(2).max(100).required(),
    address: Joi.string().min(5).max(200).required(),
    role: Joi.string().valid("user", "admin"),
  });
  return schema.validate(user);
};

const updateUserValidation = (data) => {
  const userSchema = Joi.object({
    surname: Joi.string(),
    othernames: Joi.string(),
    phoneNumber: Joi.string(),
    location: Joi.string(),
    address: Joi.string(),
  });
  return userSchema.validate(data);
};

const createGroupValidation = (data) => {
  const groupSchema = Joi.object({
    groupName: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).required(),
    livestock_id: Joi.string().required(),
    slotPrice: Joi.number().integer().min(1).positive().required(),
    // paymentMethod: Joi.string().valid("wallet", "others").required(),
    totalSlot: Joi.number().integer().min(1).positive().required(),
    // paymentReference: Joi.string().optional(),
    slotTaken: Joi.number().integer().min(1).required(),
  });

  return groupSchema.validate(data);
};

const createLivestockValidation = (data) => {
  const livestockSchema = Joi.object({
    // livestock_id: Joi.string().required(),
    name: Joi.string().min(2).required(),
    breed: Joi.string().optional(),
    weight: Joi.number().positive().optional(),
    price: Joi.number().positive().required(),
    minimum_amount: Joi.number().positive().required(),
    imageUrl: Joi.string().uri().optional(),
    description: Joi.string().optional(),
    available: Joi.boolean().default(true),
  });
  return livestockSchema.validate(data);
};

const forgotPasswordValidation = (data) => {
  const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
  });

  return forgotPasswordSchema.validate(data);
};

const resetPasswordValidation = (data) => {
  const resetPasswordSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    otp: Joi.string()
      .length(6)
      .pattern(/^\d{6}$/)
      .required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$"
        )
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
        "string.min": "Password must be at least 8 characters long",
      }),
  });

  return resetPasswordSchema.validate(data);
};
const joinGroupValidation = (data) => {
  const joinSchema = Joi.object({
    slots: Joi.number().integer().min(1).required(),
    paymentMethod: Joi.string().valid("wallet", "others").required(),
  });
  return joinSchema.validate(data);
};

const resendOtpValidation = (data) => {
  const resendOtpSchema = Joi.object({
    email: Joi.string().email().required(),
  });

  return resendOtpSchema.validate(data);
};

module.exports = {
  createUserValidation,
  updateUserValidation,
  forgotPasswordValidation,
  createGroupValidation,
  createLivestockValidation,
  joinGroupValidation,
  resetPasswordValidation,
  resendOtpValidation,
};
