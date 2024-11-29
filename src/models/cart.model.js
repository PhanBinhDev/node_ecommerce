'use strict'

const { Schema, model, Types } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'
// Declare the Schema of the Mongo model
const cartSchema = new Schema(
  {
    cart_state: {
      type: String,
      required: true,
      enum: ['active', 'completed', 'falied', 'pending'],
      default: 'active'
    },
    cart_products: { type: Array, required: true, default: [] },
    /*
      [
         {
          productId,
          shopId,
          quantity,
          price,
          name
         }
      ]
    */
    cart_count_products: { type: Number, default: 0 },
    cart_userId: { type: String }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

module.exports = { cart: model(DOCUMENT_NAME, cartSchema) }
