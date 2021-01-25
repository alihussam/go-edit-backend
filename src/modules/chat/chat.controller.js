const mongoose = require('mongoose');
const { Asset, Chat } = require('../../models');
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
const chatModel = require('../../models/chat.model');
const { findLast } = require('lodash');

/**
 * Create an asset
 * @param {req} req express request object
 * @param {res} res express response object
 * @param {next} next express ref to next middleware
 */
const create = async (req, res, next) => {
  try {
    const { profile: { _id } } = req;
    const { text, user } = req.body;

    const payload = {
      sender: _id,
      reciever: user,
      text,
    };

    const data = await Chat.create(payload);
    const final = await Chat.findOne({ _id: data._id }).populate('reciever').populate('sender');

    if (global.io) {
      // receiver, if not in chat
      global.io.emit(`notification_${user}`, {});
      global.io.emit(`notification_`);
      // receiver_sender, if in chat
      global.io.emit(`new_message_${user}_${_id}`, {
        title: final.sender && final.sender.name && final.sender.firstName
          ? final.sender.firstName + ' ' + final.sender.lastName
          : 'New message',
        text: text || ''
      });
    }

    sendResponse(res, null, final);
  } catch (error) {
    next(error);
  }
};

const getAllMessages = async (req, res, next) => {
  try {
    const { _id } = req.profile;
    const { user } = req.query;

    const data = await Chat.find({ $or: [{ reciever: user, sender: _id }, { reciever: _id, sender: user }] })
      .populate('reciever').populate('sender').lean();

    sendResponse(res, null, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GetAll All chats
 * @param {Request} req express request object
 * @param {Response} res express response object
 * @param {Next} next express ref to next middleware
 */
const getAll = async (req, res, next) => {
  try {
    const { _id } = req.profile;
    const {
      searchString,
      sender,
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

    $match.$or = [{ sender: mongoose.Types.ObjectId(_id) }, { reciever: mongoose.Types.ObjectId(_id) }];

    // construct query

    if (searchString) {
      $match.$text = { $search: searchString };
    }

    const [data] = await Chat.aggregate([
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
            {
              $addFields: {
                opposite: { $cond: [{ $eq: ['$reciever', mongoose.Types.ObjectId(_id)] }, '$sender', '$reciever'] },
              },
            },
            // group all by user
            {
              $group: {
                _id: '$opposite',
                messages: {
                  $push: {
                    text: '$text',
                    createdAt: '$createdAt',
                  },
                },
              },
            },
            // lookup user in job
            {
              $lookup: {
                from: collectionConstant.USER,
                localField: '_id',
                foreignField: '_id',
                as: 'reciever',
              },
            },
            // project to clean format data
            {
              $project: {
                user: { $arrayElemAt: ['$reciever', 0] },
                messages: 1,
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
  getAllMessages,
};
