/* eslint-disable no-underscore-dangle */
const _ = require('lodash');
const Joi = require('joi');

const { setError } = require('../helpers');
const error = require('../constants/errors');
const Schemas = require('../routes/schemas');

module.exports = (useSchema, isRegister, useJoiError = true) => {
  // useJoiError determines if we should respond with the base Joi error
  // boolean: defaults to false
  const _useJoiError = _.isBoolean(useJoiError) && useJoiError;

  // enabled HTTP methods for request data validation
  const _supportedMethods = ['post', 'put'];

  // Joi validation options
  const _validationOptions = {
    abortEarly: false, // abort after the last validation error
    allowUnknown: true, // allow unknown keys that will be ignored
    stripUnknown: true, // remove unknown keys from the validated data
  };

  // return the validation middleware
  return (req, res, next) => {
    const method = req.method.toLowerCase();

    if (_.includes(_supportedMethods, method) && _.has(Schemas, useSchema)) {
      // get schema for the current useSchema
      const _schema = _.get(Schemas, useSchema)(isRegister);

      if (_schema) {
        // Validate req.body using the schema and validation options
        return Joi.validate(req.body, _schema, _validationOptions, (err, data) => {
          if (err) {
            // Joi Error
            const JoiError = setError('badData', error.USER.InvalidProvidedData, null, {
              original: err._object,

              // fetch only message and type from each error
              details: _.map(err.details, ({ message, type }) => ({
                message: message.replace(/['"]/g, ''),
                type,
              })),
            });

            // Custom Error
            const CustomError = setError('badData', error.USER.InvalidProvidedData, err.message);

            return next(_useJoiError ? JoiError : CustomError);
          }
          // Replace req.body with the data after Joi validation
          req.body = data;
          return next();
        });
      }
    }
    return next();
  };
};
