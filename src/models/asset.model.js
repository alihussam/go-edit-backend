const mongoose = require('mongoose');
const {
  Collection: CollectionConstants,
  Common: CommonConstants,
  User: UserConstants,
  Job: JobConstants,
} = require('../constants');

const AssetSchema = mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  currency: {
    type: String,
    enum: Object.values(CommonConstants.Currencies),
    default: CommonConstants.Currencies.PKR,
  },
  resourceUrl: {
    type: String,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: CollectionConstants.USER,
  },
  isDisabled: { type: Boolean, default: false },
}, {
  timestamps: true,
});

AssetSchema.index({ title: 'text', description: 'text' });

/**
 * create and export mongoose model
 * @typedef Asset
 */
module.exports = mongoose.model(CollectionConstants.ASSET, AssetSchema, CollectionConstants.ASSET);
