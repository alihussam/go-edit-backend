const mongoose = require('mongoose');
const { Job } = require('../../models');
const {
  sendResponse,
  Factory: { ErrorFactory },
  JwtManager,
  Mappings: { Errors: { AccountErrors } },
} = require('../../libraries');
const { User: { Roles: UserRoleConstants }, Collection } = require('../../constants');
const { ACCOUNT_ALREADY_EXIST } = require('../../libraries/mappings/errors/account.errors');
const collectionConstant = require('../../constants/collection.constant');

/**
 * Create a job
 * @param {req} req express request object
 * @param {res} res express response object
 * @param {next} next express ref to next middleware
 */
const create = async (req, res, next) => {
  try {
    const { _id } = req.profile;

    // create a job
    const data = await Job.create({ ...req.body, userRole: req.role, user: _id });

    //send response back to user
    sendResponse(res, null, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GetAll Jobs based on user role
 * @param {req} req express request object
 * @param {res} res express response object
 * @param {next} next express ref to next middleware
 */
const getAll = async (req, res, next) => {
  try {
    const { _id } = req.profile;
    const {
      searchString,
      user,
      page,
    } = req.query;
    const { limit = 50 } = req.query;
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

    const [data] = await Job.aggregate([
      { $match },
      // paginate data
      {
        $facet: {
          metaData: [{ $count: 'totalDocuments' }, { $addFields: { page, limit } }],
          entries: [
            // paginate data
            { $skip: skip },
            { $limit: limit },
            // lookup user in job
            {
              $lookup: {
                from: collectionConstant.JOB,
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
                budget: 1,
                currency: 1,
                user: { $arrayElemAt: ['$user', 0] },
                userRole: 1,
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
        }
      },
    ]);

    //send response back to user
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
