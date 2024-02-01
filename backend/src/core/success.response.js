// eslint-disable-next-line max-classes-per-file
const { StatusCodes, ReasonPhrases } = require('../utils/httpStatusCode');

class SuccessResponse {
  constructor({ message, statusCode = StatusCodes.OK, reasonStatusCode = ReasonPhrases.OK, metadata = {} }) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode;
    this.metadata = metadata;
  }

  send(req, headers = {}) {
    return req.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor({ message, metadata, statusCode = StatusCodes.CREATED, reasonStatusCode = ReasonPhrases.CREATED }) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}

module.exports = {
  SuccessResponse,
  OK,
  CREATED
};
