'use strict'

const { NotFoundError } = require('../core/error.response')
const { inventory } = require('../models/inventory.model')
const { findProduct } = require('../models/repositories/product.repo')

class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = 'Nam Từ Niêm, Hà Nội'
  }) {
    const product = await findProduct({
      product_id: productId,
      unselect: ['__v']
    })

    if (!product) throw new NotFoundError('Product not found')

    const query = {
        invent_shopId: shopId,
        invent_productId: productId
      },
      updateSet = {
        $inc: {
          invent_stock: stock
        },
        $set: {
          invent_location: location
        }
      },
      options = {
        upsert: true,
        new: true
      }

    return await inventory.findByIdAndUpdate(query, updateSet, options)
  }
}

module.exports = InventoryService
