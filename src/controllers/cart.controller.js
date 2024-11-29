'use strict'

const CartService = require('../services/cart.service')
const { SuccessResponse } = require('../core/success.response')

class CartController {
  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add to cart in successfully',
      metadata: await CartService.addToCart({
        userId: req.user._id,
        product: req.body.product
      })
    }).send(res)
  }
  updateCartQuantity = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add to cart in successfully',
      metadata: await CartService.updateCart({
        userId: req.user._id,
        shop_order_ids: req.body.shop_order_ids
      })
    }).send(res)
  }
  deleteCartProductById = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add to cart in successfully',
      metadata: await CartService.deleteCart({
        userId: req.user._id,
        productId: req.params.productId
      })
    }).send(res)
  }
  getListToCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add to cart in successfully',
      metadata: await CartService.getListUserCart({
        userId: req.user._id
      })
    }).send(res)
  }
}

module.exports = new CartController()
