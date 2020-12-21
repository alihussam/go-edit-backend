const { Joi } = require('express-validation');
const {
  User: { Roles: UserRoleConstants },
  Common: CommonConstants,
  Job: JobConstants,
} = require('../../constants');

/**
 * Create job validation
 */
const create = {
  body: Joi.object({
    title: Joi
      .string()
      .required(),
    description: Joi
      .string()
      .required(),
    price: Joi
      .number()
      .required(),
    currency: Joi
      .string()
      .valid(
        CommonConstants.Currencies.PKR,
        CommonConstants.Currencies.USD,
      ),
  }),
};

/**
 * Get All currency validation
 */
const getAll = {
  query: Joi.object({
    searchString: Joi.string(),
    user: Joi.string()
      .hex()
      .min(24)
      .max(24),
    page: Joi.number(),
    limit: Joi.number(),
  }),
};

/**
 * Export all
 */
module.exports = {
  create,
  getAll,
};
