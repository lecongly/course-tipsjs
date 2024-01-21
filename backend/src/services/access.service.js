
const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const ShopRoles = {
  SHOP: '1',
  WRITER: '2',
  EDITOR: '3',
  ADMIN: '4'
}

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      const holderShop = await shopModel.finOne({ email }).lean();
      if (holderShop) {
        return {
          code: 'xx',
          message: 'Shop already exists',
          status: 'error'
        }
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [ShopRoles.SHOP]
      });

      if (newShop) {
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
          modulusLength: 4096,
        })

        console.log({ privateKey, publicKey });
      }

    } catch (error) {
      return {
        code: 'xx',
        message: error.message,
        status: 'error'
      }
    }
  }
}

module.exports = AccessService;