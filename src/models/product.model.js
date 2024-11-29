'use strict'

const { Schema, model } = require('mongoose') // Erase if already required
const { default: slugify } = require('slugify')

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

// Declare the Schema of the Mongo model
const productSchema = new Schema(
  {
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_slug: String,
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: {
      type: String,
      required: true,
      enum: ['Electronic', 'Clothing', 'Furniture']
    },
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' }, // type ObjectID, ref: "Users"
    product_attributes: { type: Schema.Types.Mixed, required: true },
    product_ratingsAvarage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be above 5.0'],
      set: (val) => Math.round(val * 10) / 10
    },
    product_variations: {
      type: Array,
      default: []
    },
    isDraft: { type: Boolean, default: true, index: true, select: false },
    isPublished: { type: Boolean, default: false, index: true, select: false }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

// create index for name and description
productSchema.index({ product_name: 'text', product_description: 'text' })
// document pre-save
productSchema.pre('save', function (next) {
  this.product_slug = slugify(this.product_name, { lower: true })
  next()
})

// define the product type = clothing
const clothingSchema = new Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' }
  },
  {
    collection: 'Clothes',
    timestamps: true
  }
)

// define the product type = electronics
const electronicSchema = new Schema(
  {
    manufacturer: { type: String, required: true },
    model: String,
    color: String,
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' }
  },
  {
    collection: 'Electronics',
    timestamps: true
  }
)

const furnitureSchema = new Schema(
  {
    brand: { type: String, required: true },
    model: String,
    color: String,
    condition: {
      type: String,
      required: true,
      enum: ['New', 'Good', 'Fair', 'Poor']
    },
    type: {
      type: String,
      required: true,
      enum: ['Table', 'Chair', 'Sofa', 'Bed']
    },
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' }
  },
  {
    collection: 'Furnitures',
    timestamps: true
  }
)

//Export the model
module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model('Clothing', clothingSchema),
  electronic: model('Electronic', electronicSchema),
  furniture: model('Furniture', furnitureSchema)
}
