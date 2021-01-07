const mongoose = require('mongoose');
const collectionConstant = require('../../constants/collection.constant');

/**
 * Schema
 */
const RatingSchema = mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: collectionConstant.USER,
  },
  job: {
    type: mongoose.Types.ObjectId,
    ref: collectionConstant.JOB,
  },
  text: {
    type: String,
  },
  rating: {
    type: Number,
    default: 1,
  },
});

/**
 * Export Schema
 */
module.exports = RatingSchema;
