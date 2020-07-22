const httpStatus = require("http-status");

module.exports = {
  JWT_EXPIRED: {
    key: 'JWT_EXPIRED',
    statusCode: httpStatus.UNAUTHORIZED,
    message: 'Your current authentication token is expired',
  },
  JWT_INVALID: {
    key: 'JWT_INVALID',
    statusCode: httpStatus.UNAUTHORIZED,
    message: 'Your authentication token is invalid',
  },
  JWT_MISSING: {
    key: 'JWT_MISSING',
    statusCode: httpStatus.UNAUTHORIZED,
    message: 'You authentication token is missing',
  },
};
