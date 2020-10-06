const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { PASSWORD: { SALT_FACTOR } } = require('../config');
const {
  Collection: CollectionConstants,
  User: UserConstants,
} = require('../constants');
const { NameSchema } = require('./schemas');

/**
 * Schema
 */
const UserSchema = mongoose.Schema({
  name: NameSchema,
  email: { type: String, unique: true },
  password: { type: String },
  isEmailVerified: { type: Boolean },
  role: {
    type: String,
    enum: Object.values(UserConstants.Roles),
  },
  imageUrl: {
    type: String,
    default: 'https://uifaces.co/our-content/donated/L7wQctBt.jpg',
  },
  isDisabled: { type: Boolean, default: false },
  // freelance profile details
  freenlancerProfile: {
    jobTitle: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    projects: {
      type: Number,
      default: 0,
    },
    assets: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
    },
    skills: [{
      type: mongoose.Types.ObjectId,
      ref: 'Skill',
    }],
  },
  employerProfile: {
    rating: {
      type: Number,
      default: 0,
    },
    projectsCompleted: {
      type: Number,
      default: 0,
    },
    assetsBought: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

/**
 * Hooks/Triggers
 */

// pre-hook that will execute before save opration
UserSchema.pre('save', async function preSaveHook(next) {
  if (this.password) {
    const hash = bcrypt.hashSync(this.password, bcrypt.genSaltSync(SALT_FACTOR));
    this.password = hash;
  }
  if (this.email) {
    const lowerCasedEmail = this.email.trim().toLowerCase();
    this.email = lowerCasedEmail;
  }
  next();
});

// pre-hook that will execute before findOneAndUpdate Operation
UserSchema.pre('findOneAndUpdate', async function preFindOneAndUpdateHook(next) {
  if (!this.getUpdate()) {
    next();
    return;
  }
  const { password, email } = this.getUpdate();
  if (password) {
    const hash = bcrypt.hashSync(this.password, bcrypt.genSaltSync(SALT_FACTOR));
    this.getUpdate().password = hash;
  }
  if (email) {
    const lowerCasedEmail = email.trim().toLowerCase();
    this.getUpdate().email = lowerCasedEmail;
  }
  next();
});

/**
 * Methods
 */
UserSchema.method({
  /**
   * Compare entered password with hash in database
   * @param {string} password entered password that is to be compared
   */
  validPassword(password) {
    const isValid = bcrypt.compareSync(password, this.password);
    return isValid;
  },
  /**
   * Returns a safe model for user
   */
  safeModel() {
    const data = _.omit(this.toObject(), ['password', '__v']);
    return data;
  },
});

/**
 * create and export mongoose model
 * @typedef User
 */
module.exports = mongoose.model('User', UserSchema, CollectionConstants.USER);