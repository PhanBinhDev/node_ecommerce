'use strict'

const crypto = require('node:crypto')
const apiKeyModel = require('../models/apiKey.model')

const findById = async (key) => {
  const objKey = await apiKeyModel.findOne({ key, status: true }).lean()

  return objKey
}

module.exports = {
  findById
}
