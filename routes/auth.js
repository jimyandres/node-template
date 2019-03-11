const express = require('express');
const passport = require('passport');
const cors = require('./cors');
const authenticate = require('../lib/authenticate');
const middlewares = require('../middlewares');

const {
  generateToken, setError, translateMsg, calculateDate,
} = require('../helpers');
const error = require('../constants/errors');
const msg = require('../constants/messages');
const expirationTime = require('../constants/index').expirationTimePasswordReset;
const { User } = require('../models');

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
 * Process register request. If successful, an email with the activation link is sent to the user
 */
router.post(
  '/register',
  middlewares.authenticate.emailUserExists,
  middlewares.schemaValidator('userDataSchema', true),
  async (req, res, next) => {
    try {
      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        birthDate: req.body.birthDate,
        phoneNumber: req.body.phoneNumber,
      });

      const user = await User.register(newUser, req.body.password);
      if (user) {
        req.user = user;
        const { email } = req.user;
        const activationToken = generateToken(email);
        const updated = await User.updateOne({ email }, { $set: { activationToken } });
        if (updated) {
          req.activationToken = activationToken;
        }
      }
      res.json({
        success: true,
        messageCode: msg.SigInSuccess,
        message: translateMsg(req.t)(msg.SigInSuccess),
      });
      return next();
    } catch (err) {
      return next(setError('badData', error.DB.RegisterUser, err.message));
    }
  },
  middlewares.mail.sendEmailAccountVerification,
);

/*
 * Process login (email/password) request.
 */
router.post(
  '/login',
  passport.authenticate('local', { session: false, failWithError: true }),
  (err, req, res, next) => next(setError('unauthorized', error.USER.LoginUser)),
  middlewares.authenticate.verifyAccountActivation,
  (req, res, next) => {
    const { user } = req;
    const token = authenticate.getToken({ _id: user._id });
    return res.json({
      success: true,
      user,
      token,
      message: translateMsg(req.t)(msg.LogInSuccess),
    });
  },
);

/*
 * Process logout request. If user is not logged-in respond with error.
 */
router.post(
  '/logout',
  middlewares.authenticate.verifyUser,
  (req, res, next) => {
    if (req.user) {
      req.logout();
      return res.json({
        success: true,
        user: {},
        messageCode: msg.LogOutSuccess,
        message: translateMsg(req.t)(msg.LogOutSuccess),
      });
    }
    return next(setError('unauthorized', error.USER.NotLoggedIn));
  },
);

/*
 * Generate hash string used to reset password.
 */
router.post(
  '/password/forgot',
  middlewares.authenticate.emailUserNotExists,
  async (req, res, next) => {
    try {
      const { email } = req.body;
      /*
      * Generate hash string to reset password and save it into the user info
      */
      const hash = generateToken(email);
      const expirationDate = calculateDate(expirationTime); // Expiration time in hours
      const updated = await User.updateOne(
        { email },
        { $set: { passwordReset: hash, resetPasswordExpires: expirationDate } },
      );
      if (updated) {
        req.hashPassReset = hash;
        req.user = await User.findOne({ email });
      }
      res.json({
        success: true,
        messageCode: msg.RestoreLinkSent,
        message: translateMsg(req.t)(msg.RestoreLinkSent),
      });
      return next();
    } catch (err) {
      return next(setError('badData', error.RegisterUserDB, err.message));
    }
  },
  middlewares.mail.sendEmailPassReset,
);

/*
* Validate hash string
*/
router.get(
  '/password/reset/:hash',
  middlewares.authenticate.checkPasswordResetHash,
  (req, res, next) => res.json({
    success: true,
    messageCode: msg.ValidHash,
    message: translateMsg(req.t)(msg.ValidHash),
  }),
);

/*
* Process save new Password
*/
router.post(
  '/password/reset',
  middlewares.authenticate.checkPasswordResetHash,
  async (req, res, next) => {
    try {
      const { hash, password } = req.body;

      const query = User.findOne({ passwordReset: hash });
      const foundUser = await query.exec();

      foundUser.setPassword(password, (err) => {
        if (err) {
          return next(setError('badData', error.DB.SetPassword, err.message));
        }
        // Delete the hash
        foundUser.passwordReset = undefined;
        foundUser.save();

        return res.json({
          success: true,
          messageCode: msg.PassResetSuccess,
          message: translateMsg(req.t)(msg.PassResetSuccess),
        });
      });
    } catch (err) {
      return next(setError('badData', error.SERVER.PassResetHash, err.message));
    }
  },
);

/*
 * Process to resend the activation link to the email user
 */
router.post(
  '/account/activate/resend',
  async (req, res, next) => {
    try {
      const { email } = req.body;
      // Get the hash string to activate the account
      const user = await User.findOne({ email });
      if (user && user.activationToken) {
        req.user = user;
        req.activationToken = user.activationToken;
        res.json({
          success: true,
          messageCode: msg.ActivationLinkSent,
          message: translateMsg(req.t)(msg.ActivationLinkSent),
        });
      } else {
        throw new Error(error.ActivationToken);
      }
      return next();
    } catch (err) {
      return next(setError('badData', error.SERVER.ResendActivationToken, err.message));
    }
  },
  middlewares.mail.sendEmailAccountVerification,
);

/*
* Process account activation
*/
router.get(
  '/account/activate/:activationtoken',
  middlewares.authenticate.checkAccountActivationHash,
  middlewares.authenticate.activateAccount,
  (req, res, next) => res.json({
    success: true,
    messageCode: msg.ActivationSuccess,
    message: translateMsg(req.t)(msg.ActivationSuccess),
  }),
);

module.exports = router;
