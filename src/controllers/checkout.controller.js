'use strict'

const CheckoutService = require('../services/checkout.service')
const { SuccessResponse } = require('../core/success.response')

class CheckoutController {
  checkoutReview = async (req, res, next) => {
    new SuccessResponse({
      message: 'Review checkout successfully',
      metadata: await CheckoutService.checkoutReview({
        userId: req.user._id,
        ...req.body
      })
    }).send(res)
  }
}

module.exports = new CheckoutController()
