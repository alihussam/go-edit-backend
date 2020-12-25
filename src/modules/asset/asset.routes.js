const router = require('express').Router();
const { validate } = require('../../middlewares');
const {
  create,
  createResource,
  update,
  getAll,
} = require('./asset.controller');

const {
  create: createValidation,
  getAll: getAllValidation,
  createResource: createResourceValidation,
  update: updateValidation,
} = require('./asset.validations');

/* Create Asset, Path - /api/asset/create */
router.post('/create',
  validate(createValidation),
  create);

/* create Resource Asset, Path - /api/asset/update */
router.post('/update',
  validate(updateValidation),
  update);

/* create Resource Asset, Path - /api/asset/createResource */
router.post('/createResource',
  validate(createResourceValidation),
  createResource);

/* Get All Assets, Path - /api/asset/getAll */
router.get('/getAll',
  validate(getAllValidation),
  getAll);

/**
 * Export router
 */
module.exports = router;
