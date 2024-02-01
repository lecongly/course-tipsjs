const _ = require('lodash');

const getInfoData = ({ fields = [], object = {} }) => {
  const data = _.pick(object, fields);
  return data;
};

module.exports = { getInfoData };
