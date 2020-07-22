const { required } = require("@hapi/joi")

const { validate } = require('express-validation');

/**
 * Validate middleware from express-validation with options set
 * @param {object} schema joi schema object
 */
module.exports = (schema) => validate(schema, { keyByField: true }, { abortEarly: false });