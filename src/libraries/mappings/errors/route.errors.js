const httpStatus = require('http-status');

module.exports = {
  ROUTE_NOT_FOUND: {
    key: 'API_NOT_FOUND',
    statusCode: httpStatus.NOT_FOUND,
    message: 'Route your are trying to access does not exist',
  },
  FORBIDDEN_ROUTE: {
    key: 'FORBIDDEN_ROUTE',
    statusCode: httpStatus.FORBIDDEN,
    message: 'You do not have sufficient permissions to access this route',
  },
  ROUTE_VALIDATION_FAILED: {
    key: 'ROUTE_VALIDATION_FAILED',
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Routes Validation Failed',
  },
};