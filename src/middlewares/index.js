const authenticate = require('./auth.middleware');
const validate = require('./validate.middleware');
const roleAccess = require('./roleAccess.middleware');

module.exports = {
  authenticate,
  validate,
  roleAccess,
};