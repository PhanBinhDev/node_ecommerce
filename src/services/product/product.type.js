'use strict'

const Product = require('./product')
const {
  clothing,
  electronic,
  furniture
} = require('../../models/product.model')
const { updateProductById } = require('../../models/repositories/product.repo')
const { removeUndefinedObject, flatternObject } = require('../../utils')
const { insertInventory } = require('../../models/repositories/inventory.repo')

function registerProductClass(model) {
  return class extends Product {
    async createProduct() {
      const newProductTypeRecord = await model.create({
        ...this.product_attributes,
        product_shop: this.product_shop
      })

      if (!newProductTypeRecord) {
        throw new BadRequestError(
          `Create new ${this.constructor.name.toLowerCase()} error`
        )
      }

      const newProduct = await super.createProduct(newProductTypeRecord._id)

      if (!newProduct) throw new BadRequestError('Create new Product error')

      // Add product_stock in inventory collection
      await insertInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity
      })
      return newProduct
    }
    async updateProduct(product_id) {
      // 1.Remove attr has null or undefined
      // 2.Check xem update ở chỗ nào
      const objectParams = removeUndefinedObject(this)

      if (objectParams.product_attributes) {
        // Update child
        await updateProductById({
          product_id,
          product_shop: objectParams.product_shop,
          payload: flatternObject(objectParams.product_attributes),
          model
        })
      }

      const updateProduct = await super.updateProduct(
        product_id,
        flatternObject(objectParams)
      )

      return updateProduct
    }
  }
}

const Clothing = registerProductClass(clothing)
const Electronic = registerProductClass(electronic)
const Furniture = registerProductClass(furniture)

module.exports = { Clothing, Electronic, Furniture }
