const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

const productSchema = new Schema({
  name: { type: String, required: true },
  thumb: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  type: { type: String, required: true, enum: ['clothing'] },
  shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  attributes: { type: Schema.Types.Mixed, required: true }
}, { timestamps: true, collection: COLLECTION_NAME });

const clothingSchema = new Schema({
  brand: { type: String, required: true },
  size: { type: String },
  material: { type: String }
}, { timestamps: true, collection: 'Clothes' });

module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model('Clothing', clothingSchema)
};
