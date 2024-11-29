const {
  findAllDraftsForShop,
  findAllPublishesForShop,
  publishProductByShop,
  unPublishProductByShop,
  searchProductsByUser,
  findAllProducts,
  findProduct
} = require('../../models/repositories/product.repo')
const ProductFactory = require('./product.factory')

class ProductService {
  // CRUD with ProductFactory
  static async createProduct(payload) {
    return await ProductFactory.create(payload)
  }
  static async updateProduct(payload) {
    return await ProductFactory.update(payload)
  }

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
  static async findProduct({ product_id }) {
    return await findProduct({ product_id, unSelect: ['__v'] })
  }
}

module.exports = ProductService
