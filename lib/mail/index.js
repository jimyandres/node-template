const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const config = require('../../config');

/*
 * SMTP configuration
 */
const smtpConfig = {
  host: config.smtpConfig.host,
  port: config.smtpConfig.port,
  secure: true,
  auth: {
    user: config.smtpConfig.user,
    pass: config.smtpConfig.pass,
  },
};

/**
 * SMTP message format
 * @param {String} subject
 * @param {String} template - template name to use
 * @param {[String]} to - email addresses
 * @param {Object} context - Object with keys to replace in the template
 */
const messageTemplate = ({
  subject, template, to, context, attachments,
}) => ({
  to,
  from: config.smtpConfig.user,
  subject,
  template,
  context,
  attachments,
});

const smtpTransport = nodemailer.createTransport(smtpConfig);

const handlebarsOptions = {
  viewEngine: {
    extName: '.hbs',
    partialsDir: path.resolve(__dirname, 'partials'),
  },
  viewPath: path.resolve(__dirname, 'templates'),
  extName: '.html',
};

smtpTransport.use('compile', hbs(handlebarsOptions));

module.exports = {
  messageTemplate,
  smtpTransport,
};
