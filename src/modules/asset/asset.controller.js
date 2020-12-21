const mongoose = require('mongoose');
const { Asset } = require('../../models');
const {
  sendResponse,
  Factory: { ErrorFactory },
  JwtManager,
  Mappings: { Errors: { AccountErrors } },
} = require('../../libraries');
const { User: { Roles: UserRoleConstants }, Collection } = require('../../constants');
const { ACCOUNT_ALREADY_EXIST } = require('../../libraries/mappings/errors/account.errors');
const collectionConstant = require('../../constants/collection.constant');
const { JobStatus, BidStatus } = require('../../constants/job.constant');

/**
 * Create an asset
 * @param {req} req express request object
 * @param {res} res express response object
 * @param {next} next express ref to next middleware
 */
const create = async (req, res, next) => {
  try {
    const { _id } = req.profile;

    const data = await Asset.create({ ...req.body, user: _id });

    sendResponse(res, null, data);
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
      $match.user = mongoose.Types.ObjectId(user);
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
                resourceUrl: 1,
                user: { $arrayElemAt: ['$user', 0] },
                createdAt: 1,
                updatedAt: 1,
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

/**
 * Export
 */
module.exports = {
  create,
  getAll,
};
