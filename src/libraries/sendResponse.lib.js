/**
 * Response Handler to send response in case of request success
 * Using this handler ensures that system has consistent response pattern
 * @param {object} res express response object
 * @param {string} successCode success code for request if available
 * @param {object} data response data for request
 * @param {any} meta any additional data for future use to avoid greater changes
 */
module.exports = (res, successCode, data, meta) => {
  res.json({
    successCode,
    data,
    meta
  });
};
