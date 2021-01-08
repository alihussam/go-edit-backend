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
    budget: Joi
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
 * Bid job validation
 */
const bid = {
  body: Joi.object({
    job: Joi.string().hex().min(24).max(24)
      .required(),
    description: Joi
      .string()
      .required(),
    budget: Joi
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
 * Bid action validation
 */
const bidAction = {
  body: Joi.object({
    job: Joi.string().hex().min(24).max(24)
      .required(),
    bid: Joi.string().hex().min(24).max(24)
      .required(),
    status: Joi.string().valid(
      JobConstants.BidStatus.ACCEPETED,
      JobConstants.BidStatus.REJECTED,
      JobConstants.BidStatus.INTERVIEWING,
    ).required(),
  }),
};

/**
 * Job action validation
 */
const jobAction = {
  body: Joi.object({
    job: Joi.string().hex().min(24).max(24)
      .required(),
    status: Joi.string().valid(
      JobConstants.JobStatus.COMPLETED,
      JobConstants.JobStatus.CANCELED,
    ).required(),
    ccNumber: Joi.string(),
    ccHolder: Joi.string(),
    ccCvv: Joi.string(),
  }),
};

/**
 * Job action validation
 */
const provideRating = {
  body: Joi.object({
    job: Joi.string().hex().min(24).max(24)
      .required(),
    user: Joi.string().hex().min(24).max(24)
      .required(),
    text: Joi.string(),
    rating: Joi.number().required(),
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
  bid,
  bidAction,
  jobAction,
  getAll,
  provideRating,
};
