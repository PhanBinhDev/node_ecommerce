'use strict'

const { BadRequestError } = require('../core/error.response')
const {
  product,
  clothing,
  electronic,
  furniture
} = require('../models/product.model')
const {
  findAllDraftsForShop,
  findAllPublishesForShop,
  publishProductByShop,
  unPublishProductByShop,
  searchProductsByUser,
  findAllProducts
} = require('../models/repositories/product.repo')

// define Factory class to create product
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

  static async update() {}

  static async getDrafts({ product_shop, limit = 50, skip = 0 }) {
    const query = {
      product_shop,
      isDraft: true
    }

    return await findAllDraftsForShop({ query, limit, skip })
  }
  static async getPublished({ product_shop, limit = 50, skip = 0 }) {
    const query = {
      product_shop,
      isPublished: true
    }

    return await findAllPublishesForShop({ query, limit, skip })
  }

  static async publish({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id })
  }
  static async unpublish({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id })
  }
  static async search({ keySearch }) {
    return await searchProductsByUser(keySearch)
  }

  static async getAll({
    limit = 50,
    sort = 'ctime',
    page = 1,
    filter = { isPublished: true }
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ['product_name', 'product_price', 'product_thumb']
    })
  }
  static async find() {}
}

// define base Product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes
  }) {
    this.product_name = product_name
    this.product_thumb = product_thumb
    this.product_description = product_description
    this.product_price = product_price
    this.product_quantity = product_quantity
    this.product_type = product_type
    this.product_shop = product_shop
    this.product_attributes = product_attributes
  }

  // create new Product
  async createProduct(_id) {
    return await product.create({ ...this, _id })
  }
}

function registerProductClass(model) {
  return class extends Product {
    async create() {
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

      return newProduct
    }
  }
}

// Defind sub-class for different product types (Electronic, Clothing, Furniture)
const Clothing = registerProductClass(clothing)
const Electronic = registerProductClass(electronic)
const Furniture = registerProductClass(furniture)

ProductFactory.registry('Clothing', Clothing)
ProductFactory.registry('Electronic', Electronic)
ProductFactory.registry('Furniture', Furniture)

module.exports = ProductFactory
