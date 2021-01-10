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
    text: Joi
      .string()
      .required(),
    user: Joi
      .string()
      .hex()
      .min(24)
      .max(24)
      .required(),
  }),
};
const getAll = {
  query: Joi.object({
    searchString: Joi.string(),
    sender: Joi.string().hex().min(24).max(24)
      .required(),
    page: Joi.number(),
    limit: Joi.number(),
  }),
};

const getAllMessages = {
  query: Joi.object({
    user: Joi.string().hex().min(24).max(24)
      .required(),
  }),
};
/**
 * Export all
 */
module.exports = {
  create,
  getAll,
  getAllMessages,
};
