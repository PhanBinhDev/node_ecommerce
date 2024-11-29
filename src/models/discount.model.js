'use strict'

const { Schema, model } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'Discounts'
// Declare the Schema of the Mongo model
const discountSchema = new Schema(
  {
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: {
      type: String,
      enum: ['fixed_amount', 'percentage'],
      default: 'fixed_amount'
    },
    discount_value: { type: Number, required: true },
    discount_code: { type: String, required: true, unique: true },
    discount_start_date: { type: Date, required: true },
    discount_end_date: { type: Date, required: true },
    discount_max_uses: { type: Number, required: true }, // Số lượng discount,
    discount_uses_count: { type: Number, required: true }, // Số lượng discount đã dùng,
    discount_users_used: { type: Array, default: [] }, // Những users đã sd,
    discount_max_uses_per_user: { type: Number, required: true }, // số lượng cho phép tôi đã mỗi user
    discount_min_order_amount: { type: Number, required: true }, // Số tiền đơn hàng tối thiểu để áp dụng discount,
    discount_max_amount_applied: { type: Number, min: 0 }, // số tiền tối đa được giảm
    discount_min_quantity: { type: Number, default: 1 }, // Số lượng sản phẩm tối thiểu để áp dụng discount,
    discount_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    discount_is_active: { type: Boolean, default: true },
    discount_applies_to: {
      type: String,
      required: true,
      enum: ['all', 'specific']
    },
    discount_product_ids: { type: Array, default: [] }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

//Export the model
// Indexes
discountSchema.index({ discount_code: 1 }, { unique: true })
discountSchema.index({ discount_shopId: 1 })
discountSchema.index({ discount_start_date: 1, discount_end_date: 1 })

// Middlewares
discountSchema.pre('save', function (next) {
  if (
    this.product_type === 'percentage' &&
    (this.product_value > 100 || this.product_value < 0)
  ) {
    throw new Error(
      'Invalid discount percentage, it should between 0% and 100%'
    )
  }

  next()
})

// Methods
discountSchema.methods.isValid = function () {
  const now = new Date()
  return (
    this.discount_is_active &&
    now >= this.discount_start_date &&
    now <= this.discount_end_date
  )
}

discountSchema.methods.canBeUsedByUser = function (userId) {
  return (
    !this.discount_users_used.includes(userId) ||
    this.discount_users_used.filter((id) => id.equals(userId)).length <
      this.discount_max_uses_per_user
  ) // Check xem user có được dùng mã giảm giá này không bao gồm (Chưa có trong danh sách người đã sử dụng hoặc số lượng sử dụng chưa đạt max)
}

module.exports = { discount: model(DOCUMENT_NAME, discountSchema) }
