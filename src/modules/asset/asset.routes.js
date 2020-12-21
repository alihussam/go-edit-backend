const router = require('express').Router();
const { validate } = require('../../middlewares');
const { create, getAll } = require('./asset.controller');

const {
  create: createValidation,
  getAll: getAllValidation,
} = require('./asset.validations');

/* Create Asset, Path - /api/asset/create */
router.post('/create',
  validate(createValidation),
  create);

/* Get All Assets, Path - /api/asset/getAll */
router.get('/getAll',
  validate(getAllValidation),
  getAll);

/**
 * Export router
 */
module.exports = router;
