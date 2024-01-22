require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { default: helmet } = require('helmet');
const compression = require('compression');

const app = express();


// Middlewares
app.use(morgan('dev'));                           // logger
app.use(helmet());                                // security
app.use(compression());                           // compress all responses
app.use(express.json());                          // parse json body
app.use(express.urlencoded({ extended: true }));  // parse urlencoded body

// Dbs
require('./db/init.mongodb');

// Routes
app.use('/', require('./routes'));

module.exports = app;