'use strict'
const crypto = require('crypto')
const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findKeyByUserId } = require('../services/keyToken.service')

const HEADER = {
  API_KEY: 'x-api-key',
  AUTHORIZATION: 'authorization',
  CLIENT_ID: 'x-client-id',
  REFRESH_TOKEN: 'x-rtoken-id'
}

const generateToken = async (payload, publicKey, privateKey) => {
  const accessToken = await JWT.sign(payload, publicKey, {
    expiresIn: '2 days'
  })
  const refreshToken = await JWT.sign(payload, privateKey, {
    expiresIn: '7 days'
  })

  return { accessToken, refreshToken }
}

const generateKey = () => {
  const publicKey = crypto.randomBytes(64).toString('hex')
  const privateKey = crypto.randomBytes(64).toString('hex')
  return { publicKey, privateKey }
}

const authentication = asyncHandler(async (req, res, next) => {
  // check userId missing
  // get accessToken
  // verify token
  // check user in db
  // check key store with userId
  // OK all -> return next

  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError('Invalid Request Header')

  const keyStore = await findKeyByUserId(userId)
  if (!keyStore) throw new NotFoundError('Not Found Key Store')

  if (req.headers[HEADER.REFRESH_TOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESH_TOKEN]
      const decodedUser = JWT.verify(refreshToken, keyStore.privateKey)

      if (userId !== decodedUser._id) throw new AuthFailureError('Invalid User')

      req.keyStore = keyStore
      req.user = decodedUser
      req.refreshToken = refreshToken
      return next()
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  let accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailureError('Invalid Request Header')

  try {
    const decoded = JWT.verify(accessToken, keyStore.publicKey)
    if (userId !== decoded._id) throw new AuthFailureError('Invalid User')

    req.keyStore = keyStore
    return next()
  } catch (error) {
    throw error
  }
})

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret)
}

module.exports = {
  generateToken,
  generateKey,
  authentication,
  authentication,
  verifyJWT
}
