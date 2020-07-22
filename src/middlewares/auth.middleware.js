const jwt = require('jsonwebtoken');
const { JWT } = require('../config');
const {
  Factory: { ErrorFactory },
  Mappings: { Errors: { JwtErrors } }
} = require('../libraries');

module.exports = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      const error = ErrorFactory.getError(JwtErrors.JWT_MISSING);
      throw error;
    }
    jwt.verify(req.headers.authorization, JWT.SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          const error = ErrorFactory.getError(JwtErrors.JWT_EXPIRED);
          throw error;
        }
        const error = ErrorFactory.getError(JwtErrors.JWT_INVALID);
        throw error;
      }
      if (!req.body) req.body = {};
      req.profile = decoded.profile;
      req.role = decoded.role;
    });
    next();
  } catch (error) {
    next(error);
  }
};
