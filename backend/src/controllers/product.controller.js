const { SuccessResponse } = require('../core/success.response');
const ProductService = require('../services/product.service');

class ProductController {
  async createProduct(req, res) {
    const { type } = req.body;

    new SuccessResponse(
      'Create product successfully',
      {
        product: await ProductService.createProduct({
          type,
          payload: {
            ...req.body,
            shop: req.user.userId
          }
        })
      }
    ).send(res);
  }
}

module.exports = new ProductController();
