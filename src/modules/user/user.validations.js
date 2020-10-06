const { Joi } = require('express-validation');
const { User: { Roles: UserRoleConstants } } = require('../../constants');

/**
 * Update profile route validation
 */
const updateProfile = {
  body: Joi.object({
    name: Joi.object({
      firstName: Joi.string().required(),
      middleName: Joi.string(),
      lastName: Joi.string().required(),
    }),
    freenlancerProfile: Joi.object({
      jobTitle: Joi.string(),
      bio: Joi.string(),
    }),
  }),
};

/**
 * Export all
 */
module.exports = {
  updateProfile,
};
