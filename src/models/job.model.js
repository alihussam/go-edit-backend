const mongoose = require('mongoose');
const {
  Collection: CollectionConstants,
  Common: CommonConstants,
  User: UserConstants,
  Job: JobConstants,
} = require('../constants');
const { JobStatus } = require('../constants/job.constant');

const BidSchema = mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: CollectionConstants.USER,
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
    default: CommonConstants.Currencies.PKR,
  },
  status: {
    type: String,
    enum: Object.values(JobConstants.BidStatus),
    default: JobConstants.BidStatus.PENDING,
  },
});

const JobSchema = mongoose.Schema({
  title: {
    type: String,
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
    default: CommonConstants.Currencies.PKR,
  },
  status: {
    type: String,
    enum: Object.values(JobConstants.JobStatus),
    default: JobConstants.JobStatus.PENDING,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: CollectionConstants.USER,
  },
  bids: [BidSchema],
  isDisabled: { type: Boolean, default: false },
}, {
  timestamps: true,
});

JobSchema.index({ title: 'text', description: 'text' });

/**
 * create and export mongoose model
 * @typedef Job
 */
module.exports = mongoose.model(CollectionConstants.JOB, JobSchema, CollectionConstants.JOB);
