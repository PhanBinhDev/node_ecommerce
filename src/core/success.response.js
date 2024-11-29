'use strict'

const { StatusCodes, ReasonPhrases } = require('http-status-codes')

class SuccessResponse {
  constructor({
    message = ReasonPhrases.OK,
    statusCode = StatusCodes.OK,
    metadata = {}
  }) {
    this.message = message
    this.status = statusCode
    this.metadata = metadata
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this)
  }
}

class OK extends SuccessResponse {
  constructor(message, metadata) {
    super(message, StatusCodes.OK, metadata)
  }
}

class CREATED extends SuccessResponse {
  constructor({ message, metadata, options = {} }) {
    super({ message, statusCode: StatusCodes.CREATED, metadata })
    this.options = options
  }
}

module.exports = {
  CREATED,
  OK,
  SuccessResponse
}
