'use strict'

const { default: Decimal } = require('decimal.js')
const _ = require('lodash')

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields)
}

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]))
}

const getUnSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]))
}

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] === undefined || obj[k] === null) {
      delete obj[k]
    }
  })

  return obj
}

const flatternObject = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : ''

    if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      Object.assign(acc, flatternObject(obj[k], pre + k))
    } else {
      acc[pre + k] = obj[k]
    }

    return acc
  }, {})
}

const decimalToNumber = (obj) => {
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key] = value instanceof Decimal ? value.toNumber() : value
  }

  return result
}
module.exports = {
  getInfoData,
  getSelectData,
  getUnSelectData,
  removeUndefinedObject,
  flatternObject,
  decimalToNumber
}
