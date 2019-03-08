const config = require('../config');
const { smtpTransport, messageTemplate } = require('../lib/mail');
const { setError } = require('../helpers');
const error = require('../constants/errors');

/*
* Send email to activate account
*/
exports.sendEmailAccountVerification = async (req, res, next) => {
  try {
    const { user, t } = req;
    const url = `${config.clientUrl}/auth/account/activate/${req.activationToken}`;
    const data = {
      subject: t('email:accountActivation.subject'),
      template: 'account-activation',
      to: [user.email],
      context: {
        name: user.firstName || 'user',
        url,
        Title: t('email:accountActivation.title'),
        Greetings: t('email:accountActivation.greetings'),
        Message1: t('email:accountActivation.message1'),
        LinkMessage: t('email:accountActivation.linkMessage'),
        Regards: t('email:accountActivation.regards'),
      },
      attachments: [
        {
          filename: 'image_file.png',
          path: `${__dirname}/../lib/mail/templates/images/image_file.png`,
          cid: 'image_file',
        },
      ],
    };

    return smtpTransport.sendMail(messageTemplate(data));
  } catch (err) {
    return next(setError('serverUnavailable', error.CantSendActivationMail, err.message));
  }
};

/*
 * Send email to reset password
 */

exports.sendEmailPassReset = async (req, res, next) => {
  try {
    const { user, t } = req;
    const url = `${config.clientUrl}/auth/password/reset/${req.hashPassReset}`;
    const data = {
      subject: t('email:forgotPassword.subject'),
      template: 'forgot-password',
      to: [user.email],
      context: {
        name: user.firstName || 'user',
        url,
        Title: t('email:forgotPassword.title'),
        Greetings: t('email:forgotPassword.greetings'),
        Message1: t('email:forgotPassword.message1'),
        LinkMessage: t('email:forgotPassword.linkMessage'),
      },
      attachments: [
        {
          filename: 'image_file.png',
          path: `${__dirname}/../lib/mail/templates/images/image_file.png`,
          cid: 'image_file',
        },
      ],
    };

    return smtpTransport.sendMail(messageTemplate(data));
  } catch (err) {
    return next(setError('serverUnavailable', error.CantSendForgotPassMail, err.message));
  }
};
