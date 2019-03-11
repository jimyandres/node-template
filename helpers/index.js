const errors = require('boom');
const crypto = require('crypto');
const errorCodes = require('../constants/errors');

/**
 * Validates the case and return its value (or default case)
 * @param {Object} cases - cases to evaluate
 * @param {string} key - key to find in 'cases' object
 */
const switchCase = cases => key => (
  Object.prototype.hasOwnProperty.call(cases, key) ? cases[key] : cases.default
);

/**
 * Validates if the case (from the switch) is a function or not
 * @param {*} f - case to evaluate
 */
const executeIfFunction = f => (f instanceof Function ? f() : f);

/**
 * This method evaluates if the case to evaluate is a function and evaluate it
 * @param {Object} cases - cases to evaluate and execute if a function
 */
const switchCaseF = cases => key => executeIfFunction(switchCase(cases)(key));

/**
 * switch function for translations
 * @param {string} nameSpace - name space where the translation exists
 * @param {string} Code - code to identify the translation string
 */
const codeSwitch = (nameSpace, Code) => switchCaseF({
  usr: `${nameSpace}:user.${Code}`,
  srv: `${nameSpace}:server.${Code}`,
  net: `${nameSpace}:network.${Code}`,
  ext: `${nameSpace}:external.${Code}`,
  default: `${nameSpace}:undefined.undef000`,
})(Code.slice(0, 3));

/**
 * Constructs and error (Boom Error) with the given data
 * Check out {@link https://github.com/hapijs/boom#readme | Boom} documentation for more
 * @param {string} errorType - the HTTP error name according to Boom documentation
 * @param {string} errorCode - translation error code
 * @param {string} customMsg - custom message to add to the error
 * @param {object} additionalData - additional data to attach to the error
 */
const setError = (errorType = 'notImplemented', errorCode, customMsg = null, additionalData = null) => {
  // The custom error code will be stored in the data prop of the error.
  const customError = errors[errorType]();
  // Set the errorCode and the custom message to the custom error object
  customError.data = { errorCode, customMsg, additionalData };
  return customError;
};

/**
 * Gets the translated error
 * @param {function} t - translation function
 * @param {string} errorCode - error code to translate
 */
const translateError = t => errorCode => t(codeSwitch('errors', errorCode));

/**
 * Gets the translated message
 * @param {function} t - translation function
 * @param {string} errorCode - message code to translate
 */
const translateMsg = t => msgCode => t(codeSwitch('messages', msgCode));

/**
 * Bomify an error
 * @param {Error} err
 */
const getBoomifyError = (err) => {
  const decorate = {};
  const errorCode = errorCodes[err.status];
  const { status: statusCode, name: message } = err;
  // Data validation error (Joi)
  if (errorCode === 'usr020') {
    decorate.error = err.error;
  }
  const boomifyError = errors.boomify(err, { statusCode, message, decorate });
  boomifyError.data = { errorCode };
  return boomifyError;
};

/**
 * Generate a hash value (token used for some authentications like password reset)
 * @param {*} value
 */
const generateToken = (value) => {
  const timeInMs = Date.now();
  const hashString = `${value}${timeInMs}`;
  const secret = crypto.randomBytes(48).toString('Hex');

  return crypto.createHmac('sha256', secret)
    .update(hashString)
    .digest('hex');
};

/**
 * Calculate the expiration date by the given time
 * @param {number} time
 */
const calculateDate = time => Date.now() + time * 3600000;

module.exports = {
  calculateDate,
  generateToken,
  getBoomifyError,
  setError,
  switchCaseF,
  translateError,
  translateMsg,
};
