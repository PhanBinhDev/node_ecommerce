'use strict'

const ProductService = require('../services/product/product.service')
const { SuccessResponse } = require('../core/success.response')

class ProductController {
  create = async (req, res, next) => {
    new SuccessResponse({
      message: 'Product created successfully',
      metadata: await ProductService.createProduct({
        ...req.body,
        product_shop: req.user._id
      })
    }).send(res)
  }
  update = async (req, res, next) => {
    new SuccessResponse({
      message: 'Product updated successfully',
      metadata: await ProductService.updateProduct({
        ...req.body,
        product_id: req.params.product_id,
        product_shop: req.user._id
      })
    }).send(res)
  }

  // Publish Features
  publish = async (req, res, next) => {
    new SuccessResponse({
      message: 'Product published successfully',
      metadata: await ProductService.publish({
        product_id: req.params.id,
        product_shop: req.user._id
      })
    }).send(res)
  }
  unpublish = async (req, res, next) => {
    new SuccessResponse({
      message: 'Product unPublished successfully',
      metadata: await ProductService.unpublish({
        product_id: req.params.id,
        product_shop: req.user._id
      })
    }).send(res)
  }

  // Query
  getDrafts = async (req, res, next) => {
    new SuccessResponse({
      message: 'Retrieved all draft products successfully',
      metadata: await ProductService.getDrafts({
        product_shop: req.user._id
      })
    }).send(res)
  }
  getPublished = async (req, res, next) => {
    new SuccessResponse({
      message: 'Retrieved all publishes products successfully',
      metadata: await ProductService.getPublished({
        product_shop: req.user._id
      })
    }).send(res)
  }
  search = async (req, res, next) => {
    new SuccessResponse({
      message: 'Retrieved all key search products successfully',
      metadata: await ProductService.search(req.params)
    }).send(res)
  }

  getAll = async (req, res, next) => {
    new SuccessResponse({
      message: 'Retrieved all products successfully',
      metadata: await ProductService.getAll(req.query)
    }).send(res)
  }
  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Retrieved product by id successfully',
      metadata: await ProductService.findProduct({
        product_id: req.params.product_id
      })
    }).send(res)
  }
  // End Query
}

module.exports = new ProductController()
