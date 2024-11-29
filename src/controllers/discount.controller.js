'use strict'

const DiscountService = require('../services/discount.service')
const { SuccessResponse } = require('../core/success.response')

class ProductController {
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: 'Success Code Generations',
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user._id
      })
    }).send(res)
  }
  getAllDiscountCodes = async (req, res, next) => {
    new SuccessResponse({
      message: 'Success Code Found',
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId: req.user._id
      })
    }).send(res)
  }
  getAllDiscountCodesWithProducts = async (req, res, next) => {
    new SuccessResponse({
      message: 'Success Get All With Products',
      metadata: await DiscountService.getAllDiscountCodeWithProduct({
        ...req.query
      })
    }).send(res)
  }

  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: 'Success Get Discount Amount',
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
        userId: req.user._id
      })
    }).send(res)
  }
  deleteDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: 'Success Delete Code',
      metadata: await DiscountService.deleteDiscountCode({
        codeId: req.params.codeId,
        shopId: req.user._id
      })
    }).send(res)
  }
  cancelDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: 'Success Cancel Discount Code',
      metadata: await DiscountService.cancelDiscountCode({
        ...req.query,
        userId: req.user._id
      })
    }).send(res)
  }
}

module.exports = new ProductController()
