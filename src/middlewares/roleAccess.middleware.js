const {
  Factory: { ErrorFactory },
  Mappings: { Errors: { RouteErrors: { FORBIDDEN_ROUTE } } }
} = require('../libraries');

/**
 * Check if a role is permitted on route
 * @param {Array} permittedRoles array of string containing roles that must be allowed on route
 */
module.exports = (permittedRoles) => (req, res, next) => {
  try {
    // if no role specified or current role not in permitted list
    if (!permittedRoles || !permittedRoles.includes(req.role)) {
      const error = ErrorFactory.getError(FORBIDDEN_ROUTE);
      throw error;
    }
    next();
  } catch (error) {
    next(error);
  }
}