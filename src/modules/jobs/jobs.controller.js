const mongoose = require('mongoose');
const { Job, User } = require('../../models');
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
const { AssetErrors } = require('../../libraries/mappings/errors');
const { update } = require('../../models/job.model');
const { isObject } = require('lodash');
const { JOB_NOT_FOUND } = require('../../libraries/mappings/errors/asset.errors');

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

    const isAlreadyPlacedBid = await Job.findOne({ _id: job, 'bids.user': _id });
    if (isAlreadyPlacedBid) {
      throw ErrorFactory.getError(AssetErrors.BID_ALREADY_PLACED);
    }

    const data = await Job.findOneAndUpdate({ _id: job },
      { $push: { bids: bidPayload } }, { new: true }).populate('user').populate('bids.user').populate('freelancer');

    if (global.io) {
      global.io.emit(`job_update_${job}`);
    }

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

    const payload = { 'bids.$.status': status };

    if (status === BidStatus.ACCEPETED) {
      payload.status = JobStatus.IN_PROGRESS;

      // find accepted user
      const tempJobData = await Job.findOne({ _id: job, 'bids._id': bidId });
      tempJobData.bids = tempJobData.bids || [];
      tempJobData.bids.forEach((bid) => {
        if (bid._id.toString() === bidId) {
          payload.freelancer = bid.user;
        }
      });
    }

    const data = await Job.findOneAndUpdate({ _id: job, 'bids._id': bidId }, payload, { new: true })
      .populate('user').populate('bids.user').populate('freelancer').lean();

    global.io.emit(`job_update_${job}`);

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
    const { _id } = req.profile;
    const { job, status, ccNumber, ccHolder, ccCvv } = req.body;

    const payload = { status };

    // if (ccNumber !== '4242-4242-4242-4242') {
    //   throw new Error('Invalid credit card details');
    // }

    const data = await Job.findOneAndUpdate({ _id: job }, payload, { new: true })
      .populate('user').populate('bids.user').populate('freelancer').lean();

    if (status === JobStatus.COMPLETED) {
      // increment it in users earned money
      await User.update({ _id: data.freelancer._id }, { $inc: { 'freenlancerProfile.earning': data.budget } });
      await User.update({ _id }, { $inc: { 'employerProfile.spent': data.budget } });
    }

    global.io.emit(`job_update_${job}`);

    sendResponse(res, null, data);
  } catch (error) {
    next(error);
  }
};

/**
 * Rating the respective users controller
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {Function} next express next middleware
 */
const provideRating = async (req, res, next) => {
  try {
    let {
      job, user, text, rating,
    } = req.body;

    // create the rating
    let ratingPayload = {
      user,
      text,
      rating,
      job,
    };

    // get job data
    const jobData = await Job.findOne({ _id: job }).lean();
    if (!jobData) {
      throw ErrorFactory.getError(AssetErrors.JOB_NOT_FOUND);
    }

    // calculate average of this users ratings
    const userData = await User.findOne({ _id: user });
    if (!userData) {
      throw ErrorFactory.getError(AccountErrors.ACCOUNT_NOT_FOUND);
    }
    userData.ratings = userData.ratings || [];
    userData.ratings.push(ratingPayload);

    const ratingSum = userData.ratings.reduce(
      (acc, ratingObject) => acc + (ratingObject.rating || 0), 0);
    let averageRating = ratingSum / userData.ratings.length;
    averageRating = isFinite(averageRating) ? averageRating : 0;

    const payload = { $push: { ratings: ratingPayload } };
    const jobPayload = {};
    // check if user providing the rating is employer or employee
    if (jobData.user.toString() === user) {
      // employer
      user = jobData.freelancer;
      payload['freenlancerProfile.rating'] = averageRating;
      payload['$inc'] = { 'freenlancerProfile.ratingCount': 1 };
      jobPayload.freelancerRating = ratingPayload;
    } else {
      // employee
      user = jobData.user;
      jobPayload.employerRating = ratingPayload;
      payload['employerProfile.rating'] = averageRating;
      payload['$inc'] = { 'employerProfile.ratingCount': 1 };
    }

    await User.update({ _id: user }, payload);

    const finalJobData = await Job.findOneAndUpdate({ _id: job }, jobPayload, { new: true })
      .populate('user').populate('bids.user').populate('freelancer')
      .populate('employerRating.user')
      .populate('freelancerRating.user')
      .lean();

    global.io.emit(`job_update_${job}`);

    sendResponse(res, null, finalJobData);
  } catch (error) {
    next(error);
  }
};


const getSingleJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const data = await await Job.findOne({ _id: jobId })
      .populate('user')
      .populate('bids.user')
      .populate('employerRating.user')
      .populate('freelancerRating.user')
      .populate('freelancer').lean();
    if (!data) {
      const error = ErrorFactory.getError(JOB_NOT_FOUND);
      throw error;
    }

    sendResponse(res, null, data);
  } catch (error) {
    next(error);
  }
}

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
      status,
      negateStatus,
      user,
      page,
      isCurrent,
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

    if (status) {
      if (Array.isArray(status)) {
        $match.status = { $in: status };
      } else {
        $match.status = status;
      }
    }

    // construct query
    if (user) {
      $match.user = mongoose.Types.ObjectId(user);
    }
    if (isCurrent) {
      $match.freelancer = mongoose.Types.ObjectId(_id);
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
            {
              $project: {
                title: 1,
                description: 1,
                budget: 1,
                bids: 1,
                status: 1,
                currency: 1,
                employerRating: 1,
                freelancerRating: 1,
                user: { $arrayElemAt: ['$user', 0] },
                createdAt: 1,
                updatedAt: 1,
              },
            },
            {
              $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$bids',
              },
            },
            // lookup user of bid
            {
              $lookup: {
                from: collectionConstant.USER,
                localField: 'bids.user',
                foreignField: '_id',
                as: 'tempBidUser',
              },
            },
            {
              $addFields: {
                'bids.user': { $arrayElemAt: ['$tempBidUser', 0] },
              },
            },
            // project to clean format data
            {
              $group: {
                _id: '$_id',
                title: { $first: '$title' },
                description: { $first: '$description' },
                budget: { $first: '$budget' },
                bids: { $push: { $cond: [{ $ne: [{ $type: '$bids._id' }, 'missing'] }, '$bids', '$$REMOVE'] } },
                currency: { $first: '$currency' },
                status: { $first: '$status' },
                user: { $first: '$user' },
                employerRating: { $first: '$employerRating' },
                freelancerRating: { $first: '$freelancerRating' },
                createdAt: { $first: '$createdAt' },
                updatedAt: { $first: '$updatedAt' },
              },
            },
            { $sort: { createdAt: -1 } },
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
  provideRating,
  getSingleJob,
};
