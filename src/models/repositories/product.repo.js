'use strict'

const {
  product,
  clothing,
  electronic,
  furniture
} = require('../../models/product.model')

const {
  Types: { ObjectId }
} = require('mongoose')
const { getSelectData, getUnSelectData } = require('../../utils')

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip })
}

const findAllPublishesForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip })
}

const publishProductByShop = async ({ product_shop, product_id }) => {
  const result = await product.updateOne(
    {
      _id: new ObjectId(product_id),
      product_shop: new ObjectId(product_shop)
    },
    {
      $set: {
        isDraft: false,
        isPublished: true
      }
    }
  )

  if (result.matchedCount === 0) {
    throw new Error('Error: Product does not belong to the shop')
  }

  return result.modifiedCount
}
const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const result = await product.updateOne(
    {
      _id: new ObjectId(product_id),
      product_shop: new ObjectId(product_shop)
    },
    {
      $set: {
        isDraft: true,
        isPublished: false
      }
    }
  )

  if (result.matchedCount === 0) {
    throw new Error('Error: Product does not belong to the shop')
  }

  return result.modifiedCount
}

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate('product_shop', 'name email _id')
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec()
}

const searchProductsByUser = async (keySearch) => {
  const regexSearch = new RegExp(keySearch)

  const result = await product
    .find(
      {
        isDraft: false,
        $text: { $search: regexSearch }
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .lean()
  return result
}

const findAllProducts = async ({
  limit = 50,
  sort = 'ctime',
  page = 1,
  filter,
  select
}) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()

  return products
}

const findProduct = async ({ product_id, unSelect }) => {
  return await product.findById(product_id).select(getUnSelectData(unSelect))
}

const updateProductById = async ({
  product_id,
  payload,
  model,
  isNew = true
}) => {
  const updatedProduct = await model.updateOne(
    {
      _id: new ObjectId(product_id),
      product_shop: new ObjectId(payload.product_shop)
    },
    payload,
    {
      new: isNew
    }
  )
  if (!updatedProduct) throw new Error('Error: Product not found')

  return updatedProduct
}

const checkProductByServer = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await findProduct({ product_id: product.productId })
      if (!foundProduct) {
        return {
          product_id: product.productId,
          isValid: false
        }
      }
      const isProductValid =
        foundProduct.product_price === product.price &&
        foundProduct.product_quantity >= product.quantity
      return {
        product_price: foundProduct.product_price,
        product_quantity: product.quantity,
        product_id: foundProduct._id,
        isValid: isProductValid,
        message: isProductValid ? 'Product Match' : 'Product Not Match'
      }
    })
  )
}

module.exports = {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishesForShop,
  unPublishProductByShop,
  searchProductsByUser,
  findAllProducts,
  findProduct,
  updateProductById,
  checkProductByServer
}
