'use strict'

const { comment } = require('../models/comment.model')
const {
  Types: { ObjectId }
} = require('mongoose')

const { BadRequestError, NotFoundError } = require('../core/error.response')

/* 
  @key features
  - createComment [User | Shop]
  - get list comment [User | Shop]
  - delete comment [User | Shop | Admin]
*/

class CommentService {
  static createComment({}) {}
}

module.exports = CommentService
