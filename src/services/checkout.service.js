'use strict'

const { BadRequestError } = require('../core/error.response')

const { findCartById } = require('../models/repositories/cart.repo')
const { checkProductByServer } = require('../models/repositories/product.repo')

const { getDiscountAmount } = require('./discount.service')
const { acquireLock, releaseLock } = require('./redis.service')

const { order } = require('../models/order.model')

class CheckoutService {
  /*
  // login and without login
  // payload
  cartId
  userId,
  shop_order_ids: [
    {
      shopId,
      shop_discounts: [],
      item_products: [
        {
          productId,
          product_quantity,
          product_price,
          product_discount
        }
      ]
    },
    {
      shopId,
      shop_discounts: [
        {
          "shopId",
          "discountId",
          "codeId"
        }
      ],
      item_products: [
        {
          productId,
          product_quantity,
          product_price,
          product_discount
        }
      ]
    }
  ],
   */

  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    // 1. Cart Validation
    const cart = await findCartById(cartId)

    if (!cart) throw new BadRequestError('Cart not found')

    // 2. Initialize Checkout Order
    const checkout_order = {
      totalPrice: 0, // Tổng tiền hàng,
      feeShip: 0,
      totalDiscount: 0, // tổng tiền được giảm
      totalCheckout: 0 // Tổng tiền thanh toán
    }

    // 3. Process Each Shop Order
    const shop_order_ids_new = await Promise.all(
      shop_order_ids.map(async (shopOrder) => {
        const { shopId, shop_discounts = [], item_products = [] } = shopOrder

        // 3a. Validate Products
        const checkProductServer = await checkProductByServer(item_products)
        if (!checkProductServer.every((product) => product.isValid)) {
          throw new BadRequestError('Order Failed!!!')
        }

        // 3b. Calculate Raw Checkout Price
        const checkoutPrice = checkProductServer.reduce((acc, product) => {
          return acc + product.product_price * product.product_quantity
        }, 0)

        checkout_order.totalPrice += checkoutPrice

        // 3c. Create Item Checkout
        const itemCheckout = {
          shopId,
          shop_discounts,
          priceRaw: checkoutPrice,
          priceApplyDiscount: 0,
          item_products: checkProductServer
        }

        // 3d. Apply Discount
        if (shop_discounts.length > 0) {
          const { discount, totalPrice } = await getDiscountAmount({
            shopId,
            products: checkProductServer,
            userId,
            codeId: shop_discounts[0].codeId
          })

          if (discount > 0) {
            itemCheckout.priceApplyDiscount = checkoutPrice - discount
            checkout_order.totalDiscount += discount
          }
        }

        // 3e. Calculate Shipping Fee
        const shipping = 0
        // 3f. Update Total Checkout
        checkout_order.totalCheckout +=
          itemCheckout.priceApplyDiscount + shipping

        return itemCheckout
      })
    )

    return {
      shop_order_ids,
      checkout_order,
      shop_order_ids_new
    }
  }
  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment
  }) {
    const { shop_order_ids_new, checkout_order } =
      CheckoutService.checkoutReview({
        cartId,
        userId,
        shop_order_ids
      })

    // check lại 1 lần nữa xem vượt tồn kho không
    const products = shop_order_ids.flatMap((order) => order.item_products)

    // implement optimistic locking
    const acquireProduct = []
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i]
      const keyLock = await acquireLock({ productId, quantity, cartId })

      acquireProduct.push(keyLock ? true : false)
      if (keyLock) {
        await releaseLock(keyLock)
      }
    }

    // check có sản phẩm hết hàng trong kho
    if (!acquireProduct.every((lock) => lock)) {
      throw new BadRequestError('Out of stock. Please check your cart')
    }

    // tạo order mới
    const newOrder = await order.create({
      order_user: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new
    })

    // Nếu insert thành công -> xóa sản phẩm có trong giỏ

    return newOrder
  }

  // Query Orders [User]
  static async getOrdersByUser() {}

  // Query Order By Id [User]
  static async getOrderById() {}

  // Cancel order [User]
  static async cancelOrderByUser() {}

  // Update Order Status [Admin]
  static async updateOrderStatusShop() {}
}
module.exports = CheckoutService
