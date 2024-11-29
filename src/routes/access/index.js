'use strict'

const express = require('express')
const {
  signIn,
  signUp,
  signOut,
  handleRefreshToken
} = require('../../controllers/access.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()

// signUp
router.post('/shop/sign-up', asyncHandler(signUp))
router.put('/shop/sign-in', asyncHandler(signIn))

// Authentication
router.use(authentication)
router.delete('/shop/sign-out', asyncHandler(signOut))
router.put('/shop/refresh-token', asyncHandler(handleRefreshToken))

module.exports = router
