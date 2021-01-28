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
    resourceUrl: Joi.string().required(),
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

/* Update validation */
const update = {
  body: Joi.object({
    assetId: Joi.string().hex().min(24).max(24)
      .required(),
    title: Joi.string(),
    description: Joi.string(),
    price: Joi.number(),
    currency: Joi.string().valid(CommonConstants.Currencies.PKR, CommonConstants.Currencies.USD),
    deletedImages: Joi.array().items(Joi.string()),
  }),
};

/**
 * Get All currency validation
 */
const getAll = {
  query: Joi.object({
    searchString: Joi.string(),
    user: Joi.string().hex().min(24).max(24),
    page: Joi.number(),
    limit: Joi.number(),
  }),
};

const createResource = {
  body: Joi.object({
    assetId: Joi.string().hex().min(24).max(24)
      .required(),
    isRemoveResource: Joi.boolean(),
  }),
};

/**
 * Export all
 */
module.exports = {
  create,
  update,
  createResource,
  getAll,
};
