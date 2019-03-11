const express = require('express');
const cluster = require('cluster');
const path = require('path');
const cookieParser = require('cookie-parser');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-express-middleware');
const Backend = require('i18next-node-fs-backend');
const logger = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');

const config = require('./config');

const connect = mongoose.connect(config.mongoUrl, {
  useCreateIndex: true,
  useNewUrlParser: true,
});

connect.then(
  () => {
    console.log(`Connected correctly to server: ${config.mongoUrl}`);

    if (cluster.isMaster) {
      // Do something if process is the master cluster (like a cron)
    }
  },
  (err) => {
    console.error(err);
    process.exit(1);
  },
);

require('./lib/authenticate');

const router = require('./routes');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// No logger on tests
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}
app.use(passport.initialize());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// i18next express middleware
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: `${__dirname}/constants/{{lng}}/{{ns}}.json`,
      addPath: `${__dirname}/constants/{{lng}}/{{ns}}.missing.json`,
    },
    ns: ['email', 'errors', 'messages'],
    defaultNS: 'common',
    fallbackLng: 'en',
    preload: ['en', 'es'],
    saveMissing: true,
  });

app.use(i18nextMiddleware.handle(i18next));

app.use(router);

module.exports = app;
