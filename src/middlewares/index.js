const authenticate = require('./auth.middleware');
const validate = require('./validate.middleware');
const roleAccess = require('./roleAccess.middleware');
const fileUpload = require('./fileUpload.middleware');

module.exports = {
  authenticate,
  validate,
  roleAccess,
  fileUpload,
};
