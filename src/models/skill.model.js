const mongoose = require('mongoose');
const {
  Collection: CollectionConstants,
  Common: CommonConstants,
} = require('../constants');

/**
 * Schema
 */
const Schema = mongoose.Schema({
  title: {
    type: String
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  isDisabled: { type: Boolean, default: false },
}, {
  timestamps: true,
});

/**
 * create and export mongoose model
 * @typedef Job
 */
module.exports = mongoose.model('Skill', Schema, CollectionConstants.SKILL);
