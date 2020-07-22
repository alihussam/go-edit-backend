const httpStatus = require("http-status");

module.exports = {
  ACCOUNT_ALREADY_EXIST: {
    key: 'ACCOUNT_ALREADY_EXIST',
    statusCode: httpStatus.CONFLICT,
    message: 'An account with this email already exist',
  },
  ACCOUNT_NOT_FOUND: {
    key: 'ACCOUNT_NOT_FOUND',
    statusCode: httpStatus.NOT_FOUND,
    message: 'No such account exist',
  },
  INVALID_LOGIN_CREDENTIALS: {
    key: 'INVALID_LOGIN_CREDENTIALS',
    statusCode: httpStatus.UNAUTHORIZED,
    message: 'Invalid login credentials',
  }
};