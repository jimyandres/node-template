require('dotenv').config();

const appName = process.argv[2];

let whitelist = process.env[`${appName}_WHITELIST`].split(',').filter(host => host !== '');
if (whitelist.length === 0) {
  whitelist = ['http://localhost:3000'];
}

module.exports = {
  appName,
  mongoUrl: process.env[`${appName}_MONGO_URL`],
  whitelist,
  jwt: {
    secretKey: process.env[`${appName}_JWT_SECRET_KEY`],
    expiresIn: process.env[`${appName}_JWT_EXPIRES_IN`],
  },
  apiUrl: process.env[`${appName}_API_URL`],
  clientUrl: process.env[`${appName}_CLIENT_URL`],
  smtpConfig: {
    host: process.env[`${appName}_SMTP_HOST`],
    port: process.env[`${appName}_SMTP_PORT`],
    user: process.env[`${appName}_SMTP_AUTH_USER`],
    pass: process.env[`${appName}_SMTP_AUTH_PASS`],
  },
};
