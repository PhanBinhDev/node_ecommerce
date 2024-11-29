'use strict'

const bcrypt = require('bcrypt')

const shopModel = require('../models/shop.model')

const KeyTokenService = require('./keyToken.service')
const { findByEmail } = require('./shop.service')

const { generateToken, generateKey, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError
} = require('../core/error.response')
const SALTS = 10

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}

class AccessService {
  static signIn = async ({ email, password, refreshToken = null }) => {
    // Step 1
    const foundShop = await findByEmail({ email })
    if (!foundShop) {
      throw new BadRequestError('Shop not registered')
    }

    // Step 2
    const isMatch = bcrypt.compare(password, foundShop.password)
    if (!isMatch) {
      throw new AuthFailureError('Authentication failed')
    }

    // Step 3
    const { publicKey, privateKey } = generateKey() // public and private keys

    const payload = getInfoData({
      fields: ['_id', 'email'],
      object: foundShop
    })

    const tokens = await generateToken(payload, publicKey, privateKey) // Generate accessToken and refreshToken

    // Save key pair to db
    await KeyTokenService.createKeyToken({
      userId: foundShop._id,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken
    })
    return {
      shop: getInfoData({
        fields: ['_id', 'name', 'email'],
        object: foundShop
      }),
      tokens
    }
  }
  static signUp = async ({ name, email, password }) => {
    // check exist email
    const holderShop = await shopModel.findOne({ email }).lean()

    if (holderShop) {
      throw new BadRequestError('Error: Shop already exists')
    }

    const passwordHashed = await bcrypt.hash(password, SALTS)

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHashed,
      roles: [RoleShop.SHOP]
    })

    if (!newShop) {
      throw new BadRequestError('Error: New shop not created')
    }

    // Version 2
    const { publicKey, privateKey } = generateKey()

    // save collection keyStore
    const keyStore = await KeyTokenService.createKeyToken({
      userId: newShop._id,
      publicKey,
      privateKey
    })

    if (!keyStore) {
      throw new BadRequestError('Error: Key store not created')
    }

    // Create token
    const payload = getInfoData({
      fields: ['_id', 'email'],
      object: newShop
    })
    const tokens = await generateToken(payload, publicKey, privateKey)

    return {
      code: 201,
      metadata: {
        shop: getInfoData({
          fields: ['_id', 'name', 'email'],
          object: newShop
        }),
        tokens
      }
    }
  }
  static signOut = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id)
    return delKey
  }
  static handleRefreshToken = async ({ refreshToken, user, keyStore }) => {
    // Check token used?
    const { _id: userId, email } = user
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId)
      throw new ForbiddenError('Something went wrong!. Pls reLogin')
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new ForbiddenError('Something went wrong with token!. Pls relogin')
    }

    const foundShop = await findByEmail({ email })
    if (!foundShop) {
      throw new AuthFailureError('Shop not registered')
    }

    // create new tokens pair
    const tokens = await generateToken(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    )

    // Save refresh token to used
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: refreshToken
      }
    })

    return {
      user,
      tokens
    }
  }
}

module.exports = AccessService
