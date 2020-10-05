const mongoose = require('mongoose');
const {
  Collection: CollectionConstants,
  Common: CommonConstants,
  User: UserConstants,
} = require('../constants');

/**
 * Schema
 */
const JobSchema = mongoose.Schema({
  title: {
    type: String
  },
  description: {
    type: String,
  },
  budget: {
    type: Number,
  },
  currency: {
    type: String,
    enum: Object.values(CommonConstants.Currencies),
    default: CommonConstants.Currencies.PKR
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  isDisabled: { type: Boolean, default: false },
}, {
  timestamps: true,
});
JobSchema.index({ title: 'text', description: 'text' });

/**
 * create and export mongoose model
 * @typedef Job
 */
module.exports = mongoose.model('Job', JobSchema, CollectionConstants.JOB);
