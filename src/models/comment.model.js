'use strict'

const { Schema, model } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Comment'
const COLLECTION_NAME = 'Comments'
// Declare the Schema of the Mongo model
const discountSchema = new Schema(
  {
    comment_productId: { type: Types.ObjectId, ref: 'Product' },
    comment_userId: { type: Number, default: 1 },
    comment_content: { type: String, default: 'text' },
    comment_left: { type: Number, default: 0 },
    comment_right: { type: Number, default: 0 },
    comment_parentId: { type: Types.ObjectId, ref: DOCUMENT_NAME },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

module.exports = { comment: model(DOCUMENT_NAME, discountSchema) }
