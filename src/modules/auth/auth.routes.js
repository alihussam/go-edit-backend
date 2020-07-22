const router = require('express').Router();
const {
  validate,
  authenticate,
} = require('../../middlewares');
const {
  login,
  signup,
  getProfile,
} = require('./auth.controller');
const {
  login: loginValidation,
  signup: signupValidation
} = require('./auth.validations');

/* Login Route, Path - /api/auth/login */
router.post('/login',
  validate(loginValidation), login);

/* Signup Route, Path - /api/auth/signup */
router.post('/signup',
  validate(signupValidation), signup);

/* Get Profile Route, Path - /api/auth/getProfile */
router.get('/getProfile',
  authenticate,
  getProfile);

/**
 * Export router
 */
module.exports = router;