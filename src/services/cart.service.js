'use strict'

const { cart } = require('../models/cart.model')
const { BadRequestError, NotFoundError } = require('../core/error.response')
const { findProduct } = require('../models/repositories/product.repo')
// Key Features

// Add product to cart
// reduce product quantity
// increase product quantity
// get cart
// delete user cart
// delete cart item

class CartService {
  static async createCart({ userId, product }) {
    const query = {
        cart_userId: userId,
        cart_state: 'active'
      },
      updateOrInsert = {
        cart_count_products: 1,
        $addToSet: {
          cart_products: product
        }
      },
      options = { upsert: true, new: true }

    return cart.findOneAndUpdate(query, updateOrInsert, options)
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product
    const query = {
        cart_userId: userId,
        'cart_products.productId': productId,
        cart_state: 'active'
      },
      updateSet = {
        $inc: {
          'cart_products.$.quantity': quantity
        }
      },
      options = {
        new: true,
        upsert: false
      }
    return cart.findOneAndUpdate(query, updateSet, options)
  }
  static async addToCart({ userId, product = {} }) {
    const foundProduct = await findProduct({
      product_id: product.productId,
      unSelect: ['_v']
    })

    if (!foundProduct) throw new NotFoundError('Product not found')

    const userCart = await cart.findOne({ cart_userId: userId })
    if (!userCart) {
      return await CartService.createCart({
        userId,
        product: {
          ...product,
          price: foundProduct.product_price,
          name: foundProduct.product_name
        }
      })
    }

    // nếu đã tồn tại giỏ hàng thì check xem đã có sản phẩm nào chưa
    const productIndex = userCart.cart_products.findIndex(
      (p) => p.productId === product.productId
    )

    if (productIndex === -1) {
      userCart.cart_products.push({
        ...product,
        price: foundProduct.product_price,
        name: foundProduct.product_name
      })
      userCart.cart_count_products++
      return await userCart.save()
    }

    return CartService.updateUserCartQuantity({ userId, product })
  }
  /*
    shop_order_ids: [
      {
        shopId,
        item_products: [
          {
            productId,
            price,
            shopId,
            old_quantity
            quantity

          }
        ],
        version
      }
    
    ]
  
  */
  static async updateCart({ userId, shop_order_ids = {} }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0]
    // Check product exists
    const foundProduct = await findProduct({ product_id: productId })
    if (!foundProduct)
      throw new NotFoundError(`Product ${product_id} not found`)
    // compare product_shop with shopId
    if (
      foundProduct.product_shop.toString() !==
      shop_order_ids[0]?.shopId.toString()
    )
      throw new Error('Invalid shopId')
    if (quantity === 0) {
      // delete service here
    }

    console.log({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity
      }
    })
    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity
      }
    })
  }

  static async deleteCart({ userId, productId }) {
    const query = {
        cart_userId: userId,
        cart_state: 'active'
      },
      updateSet = {
        $pull: {
          cart_products: { productId }
        }
      }

    const deletedCart = await cart.updateOne(query, updateSet)

    return deletedCart
  }

  static async getListUserCart({ userId }) {
    return await cart.findOne({ cart_userId: userId }).lean()
  }
}

module.exports = CartService
