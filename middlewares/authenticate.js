const passport = require('passport');

const User = require('../models/user');

const constants = require('../constants');
const { setError } = require('../helpers');
const error = require('../constants/errors');

/*
 * Verify and authenticate user token
 */
exports.verifyUser = passport.authenticate('jwt', { session: false, failWithError: true });

/*
 * Verify duplicate user email
 */
exports.emailUserExists = async (req, res, next) => {
  try {
    const filterOptions = { email: req.body.email };
    const { userResource = null } = req;
    // Validates if the request is a user-registration
    if (userResource) {
      filterOptions._id = { $ne: userResource._id };
    }
    const user = await User.findOne(filterOptions);

    if (user) {
      return next(setError('badData', error.USER.UserExists));
    }

    return next();
  } catch (err) {
    return next(setError('serverUnavailable', error.DB.DuplicateEmailValidation, err.message));
  }
};

/*
 * Verify if a user has the given email
 */
exports.emailUserNotExists = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(setError('badData', error.USER.InvalidEmail));
    }

    return next();
  } catch (err) {
    return next(setError('serverUnavailable', error.DB.EmailValidation, err.message));
  }
};

/*
 * Verify the hash string for password reset
 */
exports.checkPasswordResetHash = async (req, res, next) => {
  try {
    const user = await User.findOne({
      passwordReset: req.body.hash || req.params.hash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(setError('badData', error.USER.InvalidHash));
    }

    return next();
  } catch (err) {
    return next(setError('serverUnavailable', error.DB.PassResetHashValidation, err.message));
  }
};

/*
 * Verify the hash string for account activation
 */
exports.checkAccountActivationHash = async (req, res, next) => {
  try {
    const user = await User.findOne({ activationToken: req.params.activationtoken }, constants.userFields.join(' '));

    if (user && !user.active) {
      req.userResource = user;
      return next();
    }
    return next(setError('badData', error.USER.ActivationLink));
  } catch (err) {
    return next(setError('serverUnavailable', error.DB.AccActivationHashValidation, err.message));
  }
};

/*
 * Activates an User account by the given hash string
 */
exports.activateAccount = async (req, res, next) => {
  try {
    await User.updateOne({
      activationToken: req.params.activationtoken,
    }, {
      $set: { active: true },
      $unset: { activationToken: 1 },
    });
    return next();
  } catch (err) {
    return next(setError('serverUnavailable', error.DB.AccActivation, err.message));
  }
};

/*
 * Verify account activation
 */
exports.verifyAccountActivation = async (req, res, next) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ email });
    if (user && user.active) {
      return next();
    }
    return next(setError('unauthorized', error.USER.AccountNotActivated));
  } catch (err) {
    return next(setError('serverUnavailable', error.DB.AccActivationCheck, err.message));
  }
};
