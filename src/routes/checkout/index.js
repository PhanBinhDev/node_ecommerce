'use strict'

const express = require('express')
const { checkoutReview } = require('../../controllers/checkout.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()

// Route need Authentication
router.use(authentication)
router.get('/review', asyncHandler(checkoutReview))

module.exports = router
