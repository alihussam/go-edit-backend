const express = require('express');
const bodyParser = require('body-parser');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('morgan');
const { ValidationError } = require('express-validation');

/* Require configuration */
const { ENV } = require('./config');

/* Get required libraries */
const {
  Factory: { ErrorFactory },
  Mappings: { Errors: { RouteErrors } },
} = require('./libraries');

/* Require all routes */
const routes = require('./routes');

/* Create Express Application */
const app = express();

/**
 * Load all middlewares
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compress());
// secure apps by setting various HTTP headers
app.use(helmet());
// enable CORS - Cross Origin Resource Sharing
app.use(cors());
// configure logger if in development
if (ENV === 'development') {
  app.use(logger('dev'));
}

/**
 * Mount all routes on path /api
 */
app.use('/api', routes);

/**
 * If requested route does not exist
 */
app.use((req, res, next) => {
  const error = ErrorFactory.getError(RouteErrors.ROUTE_NOT_FOUND);
  next(error);
});

/**
 * GLOBAL ERROR HANDLER
 * this is a global error handler to catch all errors and pass it to next middleware
 * to pass a custom error to this handler from any route call next(error)
 */
app.use((err, req, res, next) => {
  let finalError = err;

  /* Validation Error */
  if (finalError instanceof ValidationError) {
    /**
     * Handling on flattened validation error
     * make sure to use custom validation middleware in middleware dir
     * or to set keyByField to true if using validate middleware directly
     * or change this handling to handle detailed Validation error
     * See: https://www.npmjs.com/package/express-validation
     */
    // deep clone whole error
    let ROUTE_VALIDATION_FAILED = { ...RouteErrors.ROUTE_VALIDATION_FAILED };
    ROUTE_VALIDATION_FAILED.meta = finalError.details;
    finalError = ErrorFactory.getError(ROUTE_VALIDATION_FAILED);
  }

  /* Unexpected Error */
  if (finalError.name !== 'APIError') {
    // log this error since this is an unexpected error that we didn't created ourself
    console.error('SYSTEM ERROR: ', finalError);
    finalError = ErrorFactory.getError();
  }
  next(finalError);
});

/**
 * This middleware sends error response back to user that is formatted by previous user
 * stack trace is sent only when the system is running in development mode
 */
app.use((err, req, res, next) =>
  res
    .status(err.statusCode)
    .json({
      message: err.message,
      errorKey: err.errorKey,
      meta: err.meta,
      stack: ENV === 'development' ? err.stack : {},
    })
);

/**
 * Export express app
 */
module.exports = app;



