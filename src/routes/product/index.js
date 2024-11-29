'use strict'

const express = require('express')
const {
  create,
  publish,
  search,
  getAll,
  unpublish,
  getDrafts,
  getPublished,
  findProduct,
  update
} = require('../../controllers/product.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()

// Route Publish
router.get('/', asyncHandler(getAll))
router.get('/:product_id', asyncHandler(findProduct))
router.get('/search/:keySearch', asyncHandler(search))

// Route need Authentication
router.use(authentication)
router.post('', asyncHandler(create))
router.patch('/:product_id', asyncHandler(update))

router.put('/publish/:id', asyncHandler(publish))
router.put('/un-publish/:id', asyncHandler(unpublish))

// QUERY //
router.get('/drafts/all', asyncHandler(getDrafts))
router.get('/publishes/all', asyncHandler(getPublished))

module.exports = router
