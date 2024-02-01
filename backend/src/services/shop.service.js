const shopModel = require('../models/shop.model');

const findByEmail = ({ email, select = { email: 1, password: 2, name: 1, status: 1, roles: 1 } }) => shopModel.findOne({ email }).select(select).lean();

module.exports = { findByEmail };
