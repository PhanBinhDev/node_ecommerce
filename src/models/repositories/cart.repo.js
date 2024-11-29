'use strict'

const { cart } = require('../../models/cart.model')
const {
  Types: { ObjectId }
} = require('mongoose')

const findCartById = async (cartId) => {
  return await cart.findOne({
    _id: new ObjectId(cartId)
  })
}

module.exports = {
  findCartById
}
