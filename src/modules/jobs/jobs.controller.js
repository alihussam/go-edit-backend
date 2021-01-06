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
const { JobStatus, BidStatus } = require('../../constants/job.constant');

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
    const data = await Job.create({ ...req.body, user: _id });

    // send response back to user
    sendResponse(res, null, data);
  } catch (error) {
    next(error);
  }
};

/**
 * Bid on a job
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {Function} next express next middleware
 */
const bid = async (req, res, next) => {
  try {
    const { _id } = req.profile;
    const {
      job, description, budget, currency,
    } = req.body;

    const bidPayload = {
      user: _id, description, budget, currency,
    };

    const data = await Job.findOneAndUpdate({ _id: job },
      { bids: { $push: bidPayload } }, { new: true });

    sendResponse(res, null, data);
  } catch (error) {
    next(error);
  }
};

/**
 * Take Action On Bid
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {Function} next express next middleware
 */
const bidAction = async (req, res, next) => {
  try {
    const { job, bid: bidId, status } = req.body;

    const payload = { 'bids.status': status };

    if (status === BidStatus.ACCEPETED) {
      payload.status = JobStatus.IN_PROGRESS;
    }

    const data = await Job.findOneAndUpdate({ _id: job, 'bids._id': bidId }, payload, { new: true });

    sendResponse(res, null, data);
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
const jobAction = async (req, res, next) => {
  try {
    const { job, status } = req.body;

    const payload = { status };

    const data = await Job.findOneAndUpdate({ _id: job }, payload, { new: true });

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

    const [data] = await Job.aggregate([
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
                budget: 1,
                bids: 1,
                currency: 1,
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
  bid,
  bidAction,
  jobAction,
  getAll,
};
