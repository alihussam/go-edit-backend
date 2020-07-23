const router = require('express').Router();
const { validate } = require('../../middlewares');
const {
  create,
  getAll,
} = require('./jobs.controller');

const {
  create: createValidation,
  getAll: getAllValidation,
} = require('./jobs.validations');

/* Create Job, Path - /api/jobs/create */
router.post('/create',
  validate(createValidation),
  create);

/* Get All Jobs, Path - /api/jobs/getAll */
router.get('/getAll',
  validate(getAllValidation),
  getAll);

/**
 * Export router
 */
module.exports = router;