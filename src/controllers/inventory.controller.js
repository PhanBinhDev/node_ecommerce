'use strict'

const InventoryService = require('../services/inventory.service')
const { SuccessResponse } = require('../core/success.response')

class InventoryController {
  addStockToInventory = async (req, res, next) => {
    new SuccessResponse({
      message: 'Product created successfully',
      metadata: await InventoryService.addStockToInventory({
        ...req.body,
        shopId: req.user._id
      })
    }).send(res)
  }
}

module.exports = new InventoryController()
