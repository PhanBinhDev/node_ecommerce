'use strict'

const { Schema, model } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Key'
const COLLECTION_NAME = 'Keys'
// Declare the Schema of the Mongo model
var keyTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'Shop'
    },
    publicKey: {
      type: String,
      required: true
    },
    privateKey: {
      type: String,
      required: true
    },
    refreshTokensUsed: {
      type: Array,
      default: [] // Những RF đã được sử dụng
    },
    refreshToken: {
      type: String,
      required: true // RF hiện tại đag sử dụng
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

//Export the model
module.exports = model(DOCUMENT_NAME, keyTokenSchema)
