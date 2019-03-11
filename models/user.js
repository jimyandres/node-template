const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const validate = require('mongoose-validator');
const validator = require('validator');
const sanitizerPlugin = require('mongoose-sanitizer-plugin');
const moment = require('moment');
const { isValidNumber } = require('libphonenumber-js');
const { namePattern, passwordPattern } = require('../constants');
const errorMessages = require('../constants/errors');
const { reqMsg } = require('../helpers/models');

const { Schema } = mongoose;

const firstNameValidator = [
  validate({
    validator: 'matches',
    arguments: [namePattern, 'g'],
    message: 'First name must not contain numbers',
    httpStatus: 422,
  }),
];

const lastNameValidator = [
  validate({
    validator: 'matches',
    arguments: [namePattern, 'g'],
    message: 'Last name must not contain numbers',
    httpStatus: 422,
  }),
];

const emailValidator = [
  validate({
    validator: 'isEmail',
    message: 'Please enter a valid E-mail',
    httpStatus: 422,
  }),
];

const passwordValidator = (password, cb) => {
  if (validator.isEmpty(password)) {
    return cb({
      code: 422,
      message: 'Password is required to register',
    });
  }

  if (!validator.isLength(password, { min: 8 })) {
    return cb({
      code: 422,
      message: 'Password must be at least 8 characters long',
    });
  }

  if (!validator.matches(password, passwordPattern, 'g')) {
    return cb({
      code: 422,
      message: 'Enter a valid password: Must have at least an upper case letter and a number',
    });
  }

  return cb(null);
};

const phoneNumberValidator = [
  validate({
    validator(val) {
      return isValidNumber(val, 'CO');
    },
    message: 'Please enter a valid Phone Number',
    httpStatus: 422,
  }),
];

const birthDateValidator = [
  validate({
    validator(val) {
      const birthDate = moment(val);
      return moment().diff(birthDate, 'years') >= 18;
    },
    message: 'You must be at least 18 years old',
    httpStatus: 422,
  }),
];

const User = new Schema({
  firstName: {
    type: String,
    lowercase: true,
    trim: true,
    required: reqMsg('No first name given'),
    validate: firstNameValidator,
  },
  lastName: {
    type: String,
    lowercase: true,
    trim: true,
    required: reqMsg('No last name given'),
    validate: lastNameValidator,
  },
  email: {
    type: String,
    trim: true,
    required: reqMsg('No email given'),
    validate: emailValidator,
    index: { unique: true },
  },
  phoneNumber: {
    type: String,
    required: reqMsg('No phone number given'),
    validate: phoneNumberValidator,
  },
  birthDate: {
    type: Date,
    required: reqMsg('No birth date given'),
    validate: birthDateValidator,
  },
  passwordReset: {
    type: String,
    index: { sparse: true },
  },
  resetPasswordExpires: {
    type: Date,
  },
  activationToken: {
    type: String,
    index: { sparse: true },
  },
  active: {
    type: Boolean,
    default: false,
  },
  admin: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

User.plugin(passportLocalMongoose, {
  usernameField: 'email',
  usernameLowerCase: true,
  errorMessages,
  passwordValidator,
});

User.plugin(sanitizerPlugin, { mode: 'sanitize' });

module.exports = mongoose.model('User', User);
