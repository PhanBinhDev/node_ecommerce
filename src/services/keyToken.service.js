'use strict'

const keytokenModel = require('../models/keytoken.model')
const {
  Types: { ObjectId }
} = require('mongoose')

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken
  }) => {
    try {
      const filter = {
        user: userId
      }
      const update = {
        publicKey,
        privateKey,
        refreshTokensUsed: [],
        refreshToken
      }
      const options = {
        upsert: true,
        new: true
      }
      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      )

      return tokens ? tokens.publicKey : null
    } catch (error) {
      return error
    }
  }
  static findKeyByUserId = async (userId) => {
    return await keytokenModel.findOne({ user: new ObjectId(userId) })
  }
  static removeKeyById = async (id) => {
    return await keytokenModel.deleteOne({ _id: new ObjectId(id) }).lean()
  }
  static findRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel
      .findOne({ refreshTokensUsed: refreshToken })
      .lean()
  }
  static findByRefreshToken = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshToken })
  }

  static deleteKeyById = async (userId) => {
    return await keytokenModel.deleteOne({ user: userId })
  }
}

module.exports = KeyTokenService
