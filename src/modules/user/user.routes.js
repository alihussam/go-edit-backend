const router = require('express').Router();
const {
  validate,
  authenticate,
  fileUpload,
} = require('../../middlewares');
const { updateProfile, updateProfilePicture } = require('./user.controller');
const { updateProfile: updateProfileValidation } = require('./user.validations');

/* Update User Profile Picture Route, Path - /api/user/updateProfilePicture */
router.post('/updateProfilePicture',
  fileUpload('files', false),
  updateProfilePicture);

/* Update User Profile Route, Path - /api/user/updateProfile */
router.post('/updateProfile',
  fileUpload('files', false),
  validate(updateProfileValidation),
  updateProfile);

/**
 * Export router
 */
module.exports = router;
