'use strict'

const express = require('express')
const {
  addToCart,
  deleteCartProductById,
  getListToCart,
  updateCartQuantity
} = require('../../controllers/cart.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()

// Route need Authentication
router.use(authentication)
router.post('', asyncHandler(addToCart))
router.delete('/:productId', asyncHandler(deleteCartProductById))
router.post('/update', asyncHandler(updateCartQuantity))
router.get('', asyncHandler(getListToCart))

module.exports = router
