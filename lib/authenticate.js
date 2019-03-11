const jwt = require('jsonwebtoken');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const config = require('../config');
const constants = require('../constants');
const User = require('../models/user');

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => jwt.sign(user, config.jwt.secretKey, {
  expiresIn: config.jwt.expiresIn,
});

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.jwt.secretKey;

passport.use(new JwtStrategy(
  opts,
  async (jwtPayload, done) => {
    try {
      const user = await User.findOne(
        { _id: jwtPayload._id },
        constants.userFields.join(' '),
      );

      if (user) {
        return done(null, user);
      }

      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  },
));
