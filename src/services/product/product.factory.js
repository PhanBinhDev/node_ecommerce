const { BadRequestError } = require('../../core/error.response')
const { Clothing, Electronic, Furniture } = require('./product.type')

class ProductFactory {
  static productClasses = {}

  static registry(type, productClass) {
    this.productClasses[type] = productClass
  }

  static async create(payload) {
    const ProductClass = this.productClasses[payload.product_type]

    if (!ProductClass) {
      throw new BadRequestError(`Invalid product Types ${payload.product_type}`)
    }
    return new ProductClass(payload).createProduct()
  }
  static async update(payload) {
    const ProductClass = this.productClasses[payload.product_type]

    if (!ProductClass) {
      throw new BadRequestError(`Invalid product Types ${payload.product_type}`)
    }

    return new ProductClass(payload).updateProduct(payload.product_id)
  }
}

ProductFactory.registry('Clothing', Clothing)
ProductFactory.registry('Electronic', Electronic)
ProductFactory.registry('Furniture', Furniture)

module.exports = ProductFactory
