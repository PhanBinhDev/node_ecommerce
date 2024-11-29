'use strict'

const express = require('express')
const {
  addStockToInventory
} = require('../../controllers/inventory.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()

// Route need Authentication
router.use(authentication)
router.post('', asyncHandler(addStockToInventory))

module.exports = router
