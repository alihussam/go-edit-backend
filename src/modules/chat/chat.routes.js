const router = require('express').Router();
const { validate, fileUpload } = require('../../middlewares');
const {
  create,
  getAll,
  getAllMessages,
} = require('./chat.controller');

const {
  create: createValidation,
  getAll: getAllValidation,
  getAllMessages: getAllMessagesValidation,
} = require('./chat.validations');

/* Create Asset, Path - /api/asset/create */
router.post('/create',
  validate(createValidation),
  create);

/* Get All Assets, Path - /api/asset/getAll */
router.get('/getAll',
  validate(getAllValidation),
  getAll);

/* Get All Assets, Path - /api/asset/getAll */
router.get('/getAllMessages',
  validate(getAllMessagesValidation),
  getAllMessages);

/**
 * Export router
 */
module.exports = router;
