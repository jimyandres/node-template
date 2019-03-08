const express = require('express');
const cors = require('./cors');
const middlewares = require('../middlewares');

const User = require('../models/user');

const { setError } = require('../helpers');
const constants = require('../constants');
const error = require('../constants/errors');

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

/*
 * Set up header Content-Type for response
 */
router.all(
  '*',
  cors.corsWithOptions,
  (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  },
);

/*
 * Respond to CORS policy preflight
 */
router.options(
  '*',
  cors.corsWithOptions,
  (req, res) => {
    res.sendStatus(200);
  },
);

/*
 * Get all users (Admin only feature)
 */
router.get(
  '/',
  middlewares.authenticate.verifyUser,
  middlewares.authorization.verifyAdmin,
  async (req, res, next) => {
    try {
      const users = await User.find({ email: { $ne: req.user.email } }, constants.userFields.join(' '));

      return res.json({ success: true, users });
    } catch (err) {
      return next(setError('notFound', error.USER.NotFound, err.message));
    }
  },
);

/*
 * Get an user info
 */
router.get(
  '/:userId',
  middlewares.authenticate.verifyUser,
  middlewares.misc.loadUser,
  middlewares.authorization.verifyUser,
  (req, res, next) => {
    const { userResource: user } = req;

    return res.json({ success: true, user });
  },
);

/*
 * Process update a User data
 */
router.put(
  '/:userId',
  middlewares.authenticate.verifyUser,
  middlewares.misc.loadUser,
  middlewares.authorization.verifyUser,
  middlewares.authenticate.emailUserExists,
  middlewares.schemaValidator('userDataSchema'),
  async (req, res, next) => {
    try {
      const userInfo = req.body;
      const { userId } = req.params;

      await User.findOneAndUpdate({ _id: userId }, userInfo, { new: true }, (err, userUpdated) => {
        if (err) {
          return next(setError('serverUnavailable', error.DB.UpdateUser, err.message));
        }
        return res.json({ success: true, userUpdated });
      });
    } catch (err) {
      return next(setError('serverUnavailable', error.SERVER.UpdateUser, err.message));
    }
  },
);

module.exports = router;
