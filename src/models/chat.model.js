const mongoose = require('mongoose');
const {
  Collection: CollectionConstants,
  Common: CommonConstants,
} = require('../constants');
const collectionConstant = require('../constants/collection.constant');

/**
 * Schema
 */
const Schema = mongoose.Schema({
  text: { type: String },
  sender: {
    type: mongoose.Types.ObjectId,
    ref: collectionConstant.USER,
  },
  reciever: {
    type: mongoose.Types.ObjectId,
    ref: collectionConstant.USER,
  },
  isDisabled: { type: Boolean, default: false },
}, {
  timestamps: true,
});

/**
 * create and export mongoose model
 * @typedef Job
 */
module.exports = mongoose.model(CollectionConstants.CHAT, Schema, CollectionConstants.CHAT);
