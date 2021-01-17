const router = require('express').Router();
const { validate, fileUpload } = require('../../middlewares');
const {
  create,
  createResource,
  update,
  getAll,
  getSingleAsset,
} = require('./asset.controller');

const {
  create: createValidation,
  getAll: getAllValidation,
  createResource: createResourceValidation,
  update: updateValidation,
} = require('./asset.validations');

/* Create Asset, Path - /api/asset/create */
router.post('/create',
  fileUpload('files', false),
  validate(createValidation),
  create);

/* create Resource Asset, Path - /api/asset/update */
router.post('/update',
  fileUpload('files', false),
  validate(updateValidation),
  update);

/* create Resource Asset, Path - /api/asset/createResource */
router.post('/createResource',
  fileUpload('files', false),
  validate(createResourceValidation),
  createResource);

/* Get All Assets, Path - /api/asset/getAll */
router.get('/getAll',
  validate(getAllValidation),
  getAll);

router.get('/getSingleAsset/:assetId',
  getSingleAsset);

/**
 * Export router
 */
module.exports = router;
