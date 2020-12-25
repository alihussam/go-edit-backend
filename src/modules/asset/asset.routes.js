const router = require('express').Router();
const { validate, fileUpload } = require('../../middlewares');
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
  fileUpload('files', false),
  create);

/* create Resource Asset, Path - /api/asset/update */
router.post('/update',
  validate(updateValidation),
  fileUpload('files', false),
  update);

/* create Resource Asset, Path - /api/asset/createResource */
router.post('/createResource',
  validate(createResourceValidation),
  fileUpload(),
  createResource);

/* Get All Assets, Path - /api/asset/getAll */
router.get('/getAll',
  validate(getAllValidation),
  getAll);

/**
 * Export router
 */
module.exports = router;
