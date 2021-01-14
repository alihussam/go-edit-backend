const { Joi } = require('express-validation');
const { User: { Roles: UserRoleConstants } } = require('../../constants');

/**
 * Update profile route validation
 */
const updateProfile = {
  body: Joi.object({
    firstName: Joi.string(),
    middleName: Joi.string(),
    lastName: Joi.string(),
    // name: Joi.object({
    //   firstName: Joi.string().required(),
    //   middleName: Joi.string(),
    //   lastName: Joi.string().required(),
    // }),
    // freenlancerProfile: Joi.object({
    //   jobTitle: Joi.string(),
    //   bio: Joi.string(),
    // }),
    jobTitle: Joi.string(),
    bio: Joi.string(),
  }),
};

const getAll = {
  query: Joi.object({
    searchString: Joi.string(),
    sortField: Joi.string(),
    user: Joi.string().hex().min(24).max(24),
    page: Joi.number(),
    limit: Joi.number(),
  }),
};

/**
 * Export all
 */
module.exports = {
  updateProfile,
  getAll,
};
