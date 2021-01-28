const mongoose = require('mongoose');
const { Asset, User } = require('../../models');
const {
  sendResponse,
  Factory: { ErrorFactory },
  JwtManager,
  Mappings: { Errors: { AccountErrors, SystemErrors } },
  FileUpload: { multiFileUpload, fileUpload },
} = require('../../libraries');
const { User: { Roles: UserRoleConstants }, Collection } = require('../../constants');
const { ACCOUNT_ALREADY_EXIST } = require('../../libraries/mappings/errors/account.errors');
const collectionConstant = require('../../constants/collection.constant');
const { JobStatus, BidStatus } = require('../../constants/job.constant');
const { AssetErrors } = require('../../libraries/mappings/errors');
const { ASSET_NOT_FOUND } = require('../../libraries/mappings/errors/asset.errors');

/**
 * Create an asset
 * @param {req} req express request object
 * @param {res} res express response object
 * @param {next} next express ref to next middleware
 */
const create = async (req, res, next) => {
  try {
    const { profile: { _id }, files = [] } = req;

    const payload = {
      ...req.body,
      user: _id,
    };

    const data = await Asset.create(payload);

    // update user asset count
    await User.update({ _id }, { $inc: { 'freenlancerProfile.assets': 1 } });

    // find resource first
    // const resourceFiles = files.filter((file) => file.originalname === 'resource');
    // if (!resourceFiles.length) {
    //   throw ErrorFactory.getError(SystemErrors.MISSING_FILE_UPLOAD_PARAMETERS);
    // }

    const fileUploadPayload = {};

    // // upload resource file first
    // const resourceUrl = await fileUpload(`ge/${_id}/assets/${data._id.toString()}`, resourceFiles[0]);
    // fileUploadPayload.resourceUrl = resourceUrl;

    // upload images
    const uploadStatus = await multiFileUpload(`ge/${_id}/assets/${data._id.toString()}`, files);

    const imageUrls = (uploadStatus.filter((us) => !us.isFailed)).map((us) => us.url);

    fileUploadPayload.$push = { imageUrls: { $each: imageUrls } };

    await Asset.updateOne({ _id: data._id }, fileUploadPayload);

    sendResponse(res, null, {
      ...data.toObject(),
      imageUrls,
      uploadStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an asset
 * @param {req} req express request object
 * @param {res} res express response object
 * @param {next} next express ref to next middleware
 */
const update = async (req, res, next) => {
  try {
    const { profile: { _id }, files } = req;
    const { assetId, deletedImages = [] } = req.body;

    const payload = { ...req.body };

    if (deletedImages.length > 0) {
      payload.$pull = { imageUrls: { $in: deletedImages } };
    }

    const data = await Asset.findOneAndUpdate({ _id: assetId, user: _id }, payload, { new: true });
    if (!data) {
      const error = ErrorFactory.getError(AssetErrors.ASSET_NOT_FOUND);
      throw error;
    }

    // upload images
    const uploadStatus = await multiFileUpload(`ge/${_id}/assets/${data._id.toString()}`, files);

    const imageUrls = (uploadStatus.filter((us) => !us.isFailed)).map((us) => us.url);

    await Asset.updateOne({ _id: data._id }, { $push: { imageUrls: { $each: imageUrls } } });

    sendResponse(res, null, {
      ...data.toObject(),
      imageUrls,
      uploadStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create an asset resource
 * @param {req} req express request object
 * @param {res} res express response object
 * @param {next} next express ref to next middleware
 */
const createResource = async (req, res, next) => {
  try {
    const { profile: { _id }, files } = req;
    const { assetId } = req.body;
    let { isRemoveResource = false } = req.body;

    if (typeof (isRemoveResource) === 'string') {
      isRemoveResource = isRemoveResource === 'true';
    }

    const payload = { resourceUrl: null };

    // upload images
    if (!isRemoveResource) {
      if (files.length > 0) {
        payload.resourceUrl = await fileUpload(`ge/${_id}/assets/${assetId.toString()}`, files[0]);
      }
    }

    const data = await Asset.findOneAndUpdate({ _id: assetId, user: _id }, payload, { new: true });
    if (!data) {
      const error = ErrorFactory.getError(AssetErrors.ASSET_NOT_FOUND);
      throw error;
    }

    sendResponse(res, null, data.toObject());
  } catch (error) {
    next(error);
  }
};

/**
 * GetAll All assets
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {Next} next express ref to next middleware
 */
const getAll = async (req, res, next) => {
  try {
    const { _id } = req.profile;
    const {
      searchString,
      user,
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
    if (user) {
      $match.$or = [
        { user: mongoose.Types.ObjectId(user) },
        { usersBought: mongoose.Types.ObjectId(user) },
      ];
    }
    if (searchString) {
      $match.$text = { $search: searchString };
    }

    const [data] = await Asset.aggregate([
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
            // lookup user in job
            {
              $lookup: {
                from: collectionConstant.USER,
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            // project to clean format data
            {
              $project: {
                title: 1,
                description: 1,
                price: 1,
                currency: 1,
                imageUrls: 1,
                resourceUrl: 1,
                user: { $arrayElemAt: ['$user', 0] },
                createdAt: 1,
                updatedAt: 1,
                usersBought: 1,
              },
            },
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

const getSingleAsset = async (req, res, next) => {
  try {
    const { assetId } = req.params;

    const data = await await Asset.findOne({ _id: assetId })
      .populate('user').lean();
    if (!data) {
      const error = ErrorFactory.getError(ASSET_NOT_FOUND);
      throw error;
    }

    sendResponse(res, null, data);
  } catch (error) {
    next(error);
  }
}

/**
 * Image upload
 * @param {req} req express request object
 * @param {res} res express response object
 * @param {next} next express ref to next middleware
 */
const singleImageUpload = async (req, res, next) => {
  try {
    const { profile: { _id }, files = [] } = req;


    // upload resource file first
    const resourceUrl = await fileUpload(`ge/${_id}/assets/all`, files[0]);

    sendResponse(res, null, resourceUrl);
  } catch (error) {
    next(error);
  }
};

/**
 * Take Action On Job
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {Function} next express next middleware
 */
const buy = async (req, res, next) => {
  try {
    const { _id } = req.profile;
    const { asset } = req.body;

    // const payload = { status };

    // if (ccNumber !== '4242-4242-4242-4242') {
    //   throw new Error('Invalid credit card details');
    // }

    const data = await Asset.findOneAndUpdate({ _id: asset }, { $push: { usersBought: _id } })
      .populate('user').lean();

    const money = data.price || 0;

    await User.update({ _id: data.user }, { $inc: { 'freenlancerProfile.earning': price } });
    await User.update({ _id }, { $inc: { 'employerProfile.spent': price } });

    sendResponse(res, null, data);
  } catch (error) {
    next(error);
  }
};

/**
 * Export
 */
module.exports = {
  create,
  update,
  createResource,
  getAll,
  getSingleAsset,
  singleImageUpload,
  buy,
};
