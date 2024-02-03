// eslint-disable-next-line max-classes-per-file
const { BadRequestError } = require('../core/error.response');
const { product, clothing } = require('../models/product.modal');

class Product {
  constructor({ name, thumb, description, price, quantity, type, shop, attributes }) {
    this.name = name;
    this.thumb = thumb;
    this.description = description;
    this.price = price;
    this.quantity = quantity;
    this.type = type;
    this.shop = shop;
    this.attributes = attributes;
  }

  create(productId) {
    return product.create({ ...this, _id: productId });
  }
}

class Clothing extends Product {
  async create() {
    const newClothing = await clothing.create({
      ...this.attributes,
      shop: this.shop
    });
    if (!newClothing) throw new BadRequestError('Cannot create clothing');

    const newProduct = await super.create(newClothing._id);
    if (!newProduct) throw new BadRequestError('Cannot create product');

    return newProduct;
  }
}

class ProductFactory {
  static async createProduct({ type, payload }) {
    switch (type) {
      case 'clothing':
        return new Clothing(payload).create();
      default:
        throw new BadRequestError(`Invalid product type: ${type}`);
    }
  }
}

module.exports = ProductFactory;
