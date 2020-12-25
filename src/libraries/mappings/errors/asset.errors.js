const httpStatus = require('http-status');

module.exports = {
  // this is used for any internal server error
  ASSET_NOT_FOUND: {
    key: 'ASSET_NOT_FOUND',
    statusCode: httpStatus.NOT_FOUND,
    message: 'Asset not found',
  },
};
