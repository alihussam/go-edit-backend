const router = require('express').Router();
const { validate } = require('../../middlewares');
const {
  create,
  bid,
  bidAction,
  jobAction,
  getAll,
} = require('./jobs.controller');

const {
  create: createValidation,
  bid: bidValidation,
  bidAction: bidActionValidation,
  jobAction: jobActionValidation,
  getAll: getAllValidation,
} = require('./jobs.validations');

/* Create Job, Path - /api/jobs/create */
router.post('/create',
  validate(createValidation),
  create);

/* Bid Job, Path - /api/jobs/bid */
router.post('/bid',
  validate(bidValidation),
  bid);

/* Bid Action, Path - /api/jobs/bidAction */
router.post('/bidAction',
  validate(bidActionValidation),
  bidAction);

/* Job Action, Path - /api/jobs/jobAction */
router.post('/jobAction',
  validate(jobActionValidation),
  jobAction);

/* Get All Jobs, Path - /api/jobs/getAll */
router.get('/getAll',
  validate(getAllValidation),
  getAll);

/**
 * Export router
 */
module.exports = router;
