'use strict'

const AccessService = require('../services/access.service')
const { CREATED, SuccessResponse } = require('../core/success.response')

class AccessController {
  signIn = async (req, res, next) => {
    new SuccessResponse({
      message: 'Logged in successfully',
      metadata: await AccessService.signIn(req.body)
    }).send(res)
  }
  signUp = async (req, res, next) => {
    new CREATED({
      message: 'Registered OK',
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10
      }
    }).send(res)
  }
  signOut = async (req, res, next) => {
    new SuccessResponse({
      message: 'Logged out successfully',
      metadata: await AccessService.signOut(req.keyStore)
    }).send(res)
  }
  handleRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get token successfully',
      metadata: await AccessService.handleRefreshToken({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore
      })
    }).send(res)
  }
}

module.exports = new AccessController()
