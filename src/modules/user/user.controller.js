const { User } = require('../../models');
const { JWT } = require('../../config');
const {
  sendResponse,
  Factory: { ErrorFactory },
  JwtManager,
  Mappings: { Errors: { AccountErrors } },
  FileUpload: { multiFileUpload },
} = require('../../libraries');
const { User: { Roles: UserRoleConstants } } = require('../../constants');
const { ACCOUNT_ALREADY_EXIST } = require('../../libraries/mappings/errors/account.errors');
const { fileUpload } = require('../../libraries/fileUpload.lib');

/**
 * Update Profile Picture controller
 * @param {req} req express request object
 * @param {res} res express response object
 * @param {next} next express ref to next middleware
 */
const updateProfilePicture = async (req, res, next) => {
  try {
    const { profile: { _id }, files = [] } = req;

    const payload = { imageUrl: null };
    if (files.length > 0) {
      payload.imageUrl = await fileUpload(`ge/${_id}`, files[0]);
    }

    const newData = await User.findOneAndUpdate({ _id }, payload, { new: true });
    if (!newData) {
      const error = ErrorFactory.getError(AccountErrors.ACCOUNT_NOT_FOUND);
      throw error;
    }

    // send response back to user
    sendResponse(res, null, newData.safeModel());
  } catch (error) {
    next(error);
  }
};

/**
 * Update Profile controller
 * @param {req} req express request object
 * @param {res} res express response object
 * @param {next} next express ref to next middleware
 */
const updateProfile = async (req, res, next) => {
  try {
    const { profile: { _id }, files } = req;
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
      };
    }

    const uploadStatus = await multiFileUpload(`ge/${_id}/${data._id.toString()}`, files);

    const imageUrls = (uploadStatus.filter((us) => !us.isFailed)).map((us) => us.url);

    updatePayload.$push = { portfolioUrls: { $each: imageUrls } };

    const newData = await User.findOneAndUpdate({ _id }, updatePayload, { new: true });

    // send response back to user
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
  updateProfilePicture,
};
