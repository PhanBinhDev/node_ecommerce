'use strict'

const { discount } = require('../models/discount.model')
const {
  Types: { ObjectId }
} = require('mongoose')

const { BadRequestError, NotFoundError } = require('../core/error.response')
const { findAllProducts } = require('../models/repositories/product.repo')
const {
  findAllDiscountCodes,
  checkDiscountExists
} = require('../models/repositories/discount.repo')
/**
 * Discount Service
 * - genarator discount code (Shop|Admin)
 * - get discount code (User)
 * - Get All discount codes (User | Shop)
 * - Verify discount code (User)
 * - Delete discount code (Shop|Admin)
 * - Cancel discount code (User)
 */

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order,
      name,
      description,
      type,
      value,
      max_uses,
      uses_count,
      max_uses_per_user,
      applies_to,
      product_ids
    } = payload

    if (start_date > end_date)
      throw new Error('start_date must be before end_date')

    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: new ObjectId(shopId)
      })
      .lean()

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError('Discount code already exists')
    }

    const newDiscount = await discount.create({
      discount_code: code,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_is_active: is_active,
      discount_shopId: new ObjectId(shopId),
      discount_min_order_amount: min_order,
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_max_uses_per_user: max_uses_per_user,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === 'all' ? [] : product_ids
    })

    return newDiscount
  }

  static async updateDiscountCode() {}

  static async getAllDiscountCodeWithProduct({
    code,
    shopId,
    userId,
    limit = 50,
    sort = 'ctime',
    page = 1
  }) {
    const foundDiscount = await checkDiscountExists({
      filter: {
        discount_code: code,
        discount_shopId: new ObjectId(shopId)
      },
      model: discount
    })

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError('Discount not found')
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount
    let products
    if (discount_applies_to === 'all') {
      // get all product
      products = await findAllProducts({
        filter: {
          product_shop: new ObjectId(shopId),
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort,
        select: ['product_name']
      })
    }

    if (discount_applies_to === 'specific') {
      // filter products by ids
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          product_shop: new ObjectId(shopId),
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort,
        select: ['product_name']
      })
    }
    return products
  }

  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodes({
      limit,
      page,
      filter: {
        discount_shopId: new ObjectId(shopId),
        discount_is_active: true
      },
      unSelect: ['_v', 'discount_shopId'],
      model: discount
    })

    return discounts
  }

  /**
   * Apply Discount
   *
   * products = [
   *  {
   *    productId,
   * productName
   * },
   * {
   *    productId,
   * productName
   * },
   * ]
   */
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      filter: {
        discount_code: codeId,
        discount_shopId: new ObjectId(shopId)
      },
      model: discount
    })

    if (!foundDiscount) throw new NotFoundError(`Discount doesn't exist`)

    const {
      discount_is_active,
      discount_max_uses,
      discount_end_date,
      discount_start_date,
      discount_min_order_amount,
      discount_max_uses_per_user,
      discount_users_used,
      discount_type,
      discount_value
    } = foundDiscount

    if (!discount_is_active) throw new Error('Discount expired')

    if (!discount_max_uses) throw new Error('Discount run out of uses')

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new Error(`Discount code has expired`)
    }

    // check giá tiền tối thiểu
    let totalOrder = 0
    if (discount_min_order_amount > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.product_price * product.product_quantity
      }, 0)

      console.log({ totalOrder, discount_min_order_amount })

      if (totalOrder < discount_min_order_amount) {
        throw new Error(
          `Order amount is not enough. Required ${discount_min_order_amount}`
        )
      }
    }

    // check xem user đó đã dùng hết số lượt tối đa chưa
    if (discount_max_uses_per_user > 0) {
      const userUseDiscount = discount_users_used.filter(
        (user) => user._id === userId
      )

      if (
        userUseDiscount &&
        userUseDiscount.length >= discount_max_uses_per_user
      ) {
        throw new Error(
          'You have reached the maximum number of uses for this discount code'
        )
      }
    }

    // check xem discount là fixed_amount hay percentage
    const amount =
      discount_type === 'fixed_amount'
        ? discount_value
        : totalOrder * (discount_value / 100)

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount
    }
  }

  static async deleteDiscountCode({ codeId, shopId }) {
    const deleted = await discount.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: new ObjectId(shopId)
    })

    if (!deleted) throw new NotFoundError('Discount not found')

    return deleted
  }

  // User cancel
  static async cancelDiscountCode({ codeId, userId, shopId }) {
    const foundDiscount = await checkDiscountExists({
      filter: {
        discount_code: codeId,
        discount_shopId: new ObjectId(shopId)
      },
      model: discount
    })

    if (!foundDiscount) throw new NotFoundError('Discount not found')

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId
      },
      $inc: {
        discount_uses_count: -1,
        discount_max_uses: 1
      }
    })

    return result
  }

  static async applyDiscountCode({ codeId, userId, shopId }) {
    const foundDiscount = await checkDiscountExists({
      filter: {
        discount_code: codeId,
        discount_shopId: new ObjectId(shopId)
      },
      model: discount
    })
  }
}

module.exports = DiscountService
