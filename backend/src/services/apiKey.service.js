const apiKeyModal = require("../models/apiKey.modal")

const findById = async (key) => {
  const keyObj = apiKeyModal.findOne({ key, status: true }).lean();
  return keyObj;
}

module.exports = {
  findById
}