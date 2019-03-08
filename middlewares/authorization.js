const { setError } = require('../helpers');
const error = require('../constants/errors');

const isAdmin = user => user.admin;

const isUserOwner = (resource, user) => user.equals(resource);

/*
 * Check if user is admin
 */
exports.verifyAdmin = (req, res, next) => (
  isAdmin(req.user)
    ? next()
    : next(setError('forbidden', error.OnlyAdminAllowed))
);

/*
 * Check user is not an admin
 */
exports.verifyNotAdmin = (req, res, next) => (
  !isAdmin(req.user)
    ? next()
    : next(setError('forbidden', error.AdminNotAllowed))
);

/*
 * Check if user is the same user requested as resource
 */
exports.verifyUser = (req, res, next) => (
  isAdmin(req.user) || isUserOwner(req.userResource, req.user)
    ? next()
    : next(setError('forbidden', error.ForbiddenAction))
);
