const Joi = require('joi');
const moment = require('moment');

/*
 * Helpers
 */

const email = Joi.string().email().lowercase().trim()
  .required();

const name = Joi.string().regex(/^[a-zA-ZÀ-ž][\\sa-zA-ZÀ-ž]*$/).required();

const birthDate = Joi.date().max(moment().add(-18, 'years').toISOString())
  .options({ language: { date: { max: 'You must be at least 18 years old' } } })
  .label('Birth Date:')
  .required();

const token = Joi.string().token().required();

/**
 * Return a Joi.when function by the given params
 * @param {String} type - param evaluated
 * @param {Object} is
 * @param {Object} then
 * @param {Object} otherwise
 */
const when = (type, is, then, otherwise = Joi.strip()) => Joi.when(type, {
  is,
  then,
  otherwise,
});

/*
 * Schemas
 */

const userDataSchema = (isRegister = false) => Joi.object().keys({
  birthDate,
  email,
  firstName: name,
  lastName: name,
  password: isRegister ? Joi.string() : Joi.string().strip(),
  phoneNumber: Joi.string(),
});

module.exports = {
  // Helpers
  birthDate,
  email,
  name,
  token,
  // Schemas
  userDataSchema,
};
