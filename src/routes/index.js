'use strict'

const express = require('express')
const { apiKey, permission } = require('../auth/checkAuth')
const router = express.Router()

// Check apiKey
router.use(apiKey)
// Check permission
router.use(permission('0000'))
router.use('', require('./access'))
router.use('/product', require('./product'))
router.use('/discount', require('./discount'))
router.use('/cart', require('./cart'))
router.use('/checkout', require('./checkout'))
router.use('/inventory', require('./inventory'))
module.exports = router
