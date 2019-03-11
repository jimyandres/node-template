const mongoose = require('mongoose');
const validate = require('mongoose-validator');

/**
 * Return the corresponding msg format to display for a required option enabled
 * @param {string} msg - message to display
 */
const reqMsg = msg => ([true, msg]);

/**
 * Check if the string is a "valid" ObjectId (12 bytes)
 * @param {string} id - id to validate
 */
const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

/**
 * General validation for a models ObjectId
 * @param {string} modelName
 */
const ObjectIdValidator = modelName => [
  validate({
    validator: val => isValidObjectId(val),
    message: `The ${modelName} id given is not valid`,
    httpStatus: 400,
  }),
];

module.exports = {
  reqMsg,
  isValidObjectId,
  // common validator
  ObjectIdValidator,
};
