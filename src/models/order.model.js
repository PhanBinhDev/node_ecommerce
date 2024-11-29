'use strict'

const { Schema, model } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'
// Declare the Schema of the Mongo model
var orderSchema = new Schema(
  {
    order_user: { type: Number, required: true },
    order_checkout: { type: Object, default: {} },
    /* 
      totalPrice,
      totalApplyDiscount,
      feeShip
    */
    order_shipping: { type: Object, required: true },
    /* 
      street,
      city,
      state,
      country,
    */
    order_payment: { type: Object, required: true },
    order_products: { type: Array, default: [] },
    order_trackingNumber: { type: String, default: '#0000106102024' },
    order_status: {
      type: String,
      enum: ['pending', 'confirmed', 'delivered', 'shipped', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

//Export the model
module.exports = { order: model(DOCUMENT_NAME, orderSchema) }
