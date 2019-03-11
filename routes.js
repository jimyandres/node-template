const express = require('express');
const errors = require('boom');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

const { setError } = require('./helpers');
const error = require('./constants/errors');

const {
  getBoomifyError,
  translateError: tError,
} = require('./helpers');

const router = express.Router();

router.use('/', indexRouter);
router.use('/auth', authRouter);
router.use('/users', usersRouter);

// catch 404 and forward to error handler
router.use((req, res, next) => {
  next(setError('notFound', error.NotFound));
});

// catch unhandled errors
router.use((err, req, res, next) => {
  let e = err;
  if (!(err instanceof errors)) {
    e = getBoomifyError(err);
  }
  return next(e);
});

// error handler
router.use((err, req, res, next) => {
  let e = err;
  // set locals, only providing error in development
  if (err instanceof errors) {
    /* eslint-disable no-param-reassign */
    const tmp = new Error();
    tmp.errorCode = err.data.errorCode;
    tmp.message = tError(req.t)(err.data.errorCode) || err.message || err.output.payload.message;
    tmp.customMessage = err.data.customMsg;
    tmp.additionalData = err.data.additionalData;
    tmp.status = err.output.payload.statusCode;
    tmp.data = err.output.payload;
    e = tmp;
    /* eslint-enable no-param-reassign */
  } else {
    console.error('Unhandled error', err);
  }

  res.locals.message = err.message || 'Something went wrong';
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(e.status || e.statusCode || 500);

  if (res.headersSent) {
    console.error('Error processing background request', e);
  } else if (e.message && typeof e.message === 'object') {
    return res.json({ success: false, ...e.message });
  }

  return res.json({ success: false, error: e });
});

module.exports = router;
