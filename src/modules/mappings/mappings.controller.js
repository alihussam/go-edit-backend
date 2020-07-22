const { Mappings, sendResponse } = require('../../libraries');

const minifiedMappings = {};

/* When file load, create minified objects for success & error keys */
Object.keys(Mappings).forEach((key) => {
  minifiedMappings[key] = {};
  Object.keys(Mappings[key]).forEach((nestedKey) => {
    Object.keys(Mappings[key][nestedKey]).forEach((deepNestedKey) => {
      minifiedMappings[key][deepNestedKey] = Mappings[key][nestedKey][deepNestedKey].message;
    });
  });
});

/**
 * Get key:value pairs of all error/success & message mappings 
 * @param {object} req express request object
 * @param {object} res express request object
 * @param {function} next express ref to next middleware
 */
const get = async (req, res, next) => {
  try {
    sendResponse(res, null, minifiedMappings);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  get,
};