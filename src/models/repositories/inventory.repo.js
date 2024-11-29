'use strict'

const { inventory } = require('../inventory.model')
const {
  Types: { ObjectId }
} = require('mongoose')
const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = 'unKnow'
}) => {
  return await inventory.create({
    inven_productId: productId,
    inven_shopId: shopId,
    inven_stock: stock,
    inven_location: location
  })
}

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
      inven_productId: new ObjectId(productId),
      inven_stock: { $gte: quantity }
    },
    updateSet = {
      $inc: { inven_stock: -quantity },
      $push: {
        inven_reservations: {
          quantity,
          cartId,
          createdAt: new Date()
        }
      }
    },
    options = { upsert: true, new: true }

  return await inventory.findOneAndUpdate(query, updateSet, options)
}

module.exports = {
  insertInventory,
  reservationInventory
}
