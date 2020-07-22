const jwt = require('jsonwebtoken');

const generateToken = (data, secret, options = {}) => {
  try {
    return jwt.sign(data, secret, options);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateToken,
};
