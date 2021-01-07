const { User } = require('../../models');
const { JWT } = require('../../config');
const {
  sendResponse,
  Factory: { ErrorFactory },
  JwtManager,
  Mappings: { Errors: { AccountErrors } },
} = require('../../libraries');
const { User: { Roles: UserRoleConstants } } = require('../../constants');
const { ACCOUNT_ALREADY_EXIST } = require('../../libraries/mappings/errors/account.errors');

/**
 * Single login controller for all users
 * @param {req} req express request object
 * @param {res} res express response object
 * @param {next} next express ref to next middleware
 */
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // check if this user exist
    const data = await User.findOne({ email, role });
    if (!data) {
      const error = ErrorFactory.getError(AccountErrors.ACCOUNT_NOT_FOUND);
      throw error;
    }

    // check accounts password
    if (!data.validPassword(password)) {
      const error = ErrorFactory.getError(AccountErrors.INVALID_LOGIN_CREDENTIALS);
      throw error;
    }

    // generate jwt
    const token = JwtManager.generateToken(
      { profile: data.safeModel(), role },
      JWT.SECRET,
      { expiresIn: JWT.EXPIRES_IN },
    );

    // send response back to user
    sendResponse(res, null, { profile: data.safeModel(), token });
  } catch (error) {
    next(error);
  }
};

/**
 * Single Signup controller for all users
 * @param {req} req express request object
 * @param {res} res express response object
 * @param {next} next express ref to next middleware
 */
const signup = async (req, res, next) => {
  try {
    const { role, email } = req.body;

    // check if the user already exist
    const isExist = await User.exists({ email, role });
    if (isExist) {
      const error = ErrorFactory.getError(ACCOUNT_ALREADY_EXIST);
      throw error;
    }

    // create account other wise
    const data = await new User(req.body).save();

    // generate jwt
    const token = JwtManager.generateToken(
      { profile: data.safeModel(), role },
      JWT.SECRET,
      { expiresIn: JWT.EXPIRES_IN },
    );

    // send response back to user
    sendResponse(res, null, { token, profile: data.safeModel() });
  } catch (error) {
    next(error);
  }
};

/**
 * Single getProfile controller for all users
 * @param {req} req express request object
 * @param {res} res express response object
 * @param {next} next express ref to next middleware
 */
const getProfile = async (req, res, next) => {
  try {
    const { _id } = req.profile;
    const data = await User.findOne({ _id, role: req.role });
    if (!data) {
      const error = ErrorFactory.getError(AccountErrors.ACCOUNT_NOT_FOUND);
      throw error;
    }
    sendResponse(res, null, data.safeModel());
  } catch (error) {
    next(error);
  }
};

/**
 * Export
 */
module.exports = {
  login,
  signup,
  getProfile,
};
