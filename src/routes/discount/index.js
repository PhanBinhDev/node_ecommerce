'use strict'

const express = require('express')
const {
  createDiscountCode,
  getAllDiscountCodes,
  getAllDiscountCodesWithProducts,
  getDiscountAmount,
  deleteDiscountCode,
  cancelDiscountCode
} = require('../../controllers/discount.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()

// Route Publish
// user get amount a discount
router.get('/amount', asyncHandler(getDiscountAmount))
router.get('/list-product-code', asyncHandler(getAllDiscountCodesWithProducts))

// Route need Authentication
router.use(authentication)
router.post('', asyncHandler(createDiscountCode))
router.delete('/:codeId', asyncHandler(deleteDiscountCode))
router.patch('/cancel', asyncHandler(cancelDiscountCode))
router.get('/shop', asyncHandler(getAllDiscountCodes))

// router.patch('/:product_id', asyncHandler(update))

// router.put('/publish/:id', asyncHandler(publish))
// router.put('/un-publish/:id', asyncHandler(unpublish))

// // QUERY //
// router.get('/drafts/all', asyncHandler(getDrafts))
// router.get('/publishes/all', asyncHandler(getPublished))

module.exports = router
