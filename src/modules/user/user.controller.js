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
const { fromPairs } = require('lodash');

/**
 * Update Profile controller
 * @param {req} req express request object
 * @param {res} res express response object
 * @param {next} next express ref to next middleware
 */
const updateProfile = async (req, res, next) => {
  try {
    const { _id } = req.profile;
    const { name, freenlancerProfile } = req.body;

    // check if this user exist
    const data = await User.findOne({ _id });
    if (!data) {
      const error = ErrorFactory.getError(AccountErrors.ACCOUNT_NOT_FOUND);
      throw error;
    }

    const updatePayload = {};
    if (name) updatePayload.name = name;
    if (freenlancerProfile) {
      updatePayload.freenlancerProfile = {
        ...data.freenlancerProfile,
        ...freenlancerProfile,
      }
    }

    const newData = await User.findOneAndUpdate({ _id }, updatePayload, { new: true });

    //send response back to user
    sendResponse(res, null, newData.safeModel());
  } catch (error) {
    next(error);
  }
};

/**
 * Export
 */
module.exports = {
  updateProfile,
};
