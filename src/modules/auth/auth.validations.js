const { Joi } = require('express-validation');
const { User: { Roles: UserRoleConstants } } = require('../../constants');

/**
 * Login route validation
 */
const login = {
  body: Joi.object({
    email: Joi
      .string()
      .email()
      .required(),
    password: Joi
      .string()
      .required(),
    role: Joi
      .string()
      .valid(
        UserRoleConstants.USER,
        UserRoleConstants.ADMIN,
      )
      .required(),
  }),
};

/**
 * Signup route validation
 * Change Input Validations according to role
 * See Joi.when
 */
const signup = {
  body: Joi.object({
    role: Joi
      .string()
      .valid(
        UserRoleConstants.USER,
        UserRoleConstants.ADMIN,
      )
      .required(),
    name: Joi.object({
      firstName: Joi.string().required(),
      middleName: Joi.string(),
      lastName: Joi.string().required(),
    }).required(),
    email: Joi
      .string()
      .email()
      .required(),
    password: Joi
      .string()
      .required(),
  }),
};

/**
 * Export all
 */
module.exports = {
  login,
  signup,
};
