require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { default: helmet } = require('helmet');
const compression = require('compression');

const app = express();

// Middlewares
app.use(morgan('dev')); // logger
app.use(helmet()); // security
app.use(compression()); // compress all responses
app.use(express.json()); // parse json body
app.use(express.urlencoded({ extended: true })); // parse urlencoded body

// Dbs
require('./db/init.mongodb');

// Routes
app.use('/', require('./routes'));

// Error handler
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    // stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
    message: error.message || 'Internal server error'
  });
});

module.exports = app;
