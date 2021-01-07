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
    const {
      firstName, lastName, middleName, jobTitle, bio,
    } = req.body;

    const name = {
      firstName,
      lastName,
    };

    if (middleName) name.middleName = middleName;

    const freenlancerProfile = {};
    if (jobTitle) freenlancerProfile.jobTitle = jobTitle;
    if (bio) freenlancerProfile.bio = bio;

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
 * GetAll All users
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {Next} next express ref to next middleware
 */
const getAll = async (req, res, next) => {
  try {
    const { _id } = req.profile;
    const {
      searchString,
      page,
    } = req.query;
    let { limit = 50 } = req.query;
    let skip;
    const $match = {};

    // construct pagination
    if (!page) {
      skip = 0;
      limit = Number.MAX_SAFE_INTEGER;
    } else {
      skip = (page * limit) - limit;
    }

    // construct query
    // if (searchString) {
    //   $match.$text = { $search: searchString };
    // }

    const [data] = await User.aggregate([
      { $match },
      // paginate data
      {
        $facet: {
          metaData: [{ $count: 'totalDocuments' }, { $addFields: { page, limit } }],
          entries: [
            // paginate data
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
      // project to handle empty responses
      {
        $project: {
          entries: 1,
          metaData: { $ifNull: [{ $arrayElemAt: ['$metaData', 0] }, { totalDocuments: 0, page, limit }] },
        },
      },
    ]);

    // send response back to user
    sendResponse(res, null, data);
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
  getAll,
};
