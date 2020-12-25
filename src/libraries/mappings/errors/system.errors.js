const httpStatus = require('http-status');

module.exports = {
  // this is used for any internal server error
  UNKOWN_PROBLEM: {
    key: 'UNKOWN_PROBLEM',
    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
    message: 'An unkown problem occured while processing your request',
  },
  MISSING_FILE_UPLOAD_PARAMETERS: {
    key: 'MISSING_FILE_UPLOAD_PARAMETERS',
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Required parameters missing for file upload',
  },
};
