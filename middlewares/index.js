const constants = require('../constants');
const error = require('../constants/errors');
const { setError } = require('../helpers');
const User = require('../models/user');

const authenticate = require('./authenticate');
const authorization = require('./authorization');
const mail = require('./mail');
const schemaValidator = require('./schemaValidator');

/*
 * Search requested user and load it to request object
 */
const loadUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId, constants.userFields.join(' '));

    if (!user) {
      const customMsg = `User ${userId} not found`;
      return next(setError('notFound', error.UserNotFound, customMsg));
    }

    req.userResource = user;
    return next();
  } catch (err) {
    return next(setError('serverUnavailable', error.DBResource, err.message));
  }
};

module.exports = {
  authenticate,
  authorization,
  mail,
  schemaValidator,
  misc: {
    loadUser,
  },
};
