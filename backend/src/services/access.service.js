
const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const keyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');

const ShopRoles = {
  SHOP: '1',
  WRITER: '2',
  EDITOR: '3',
  ADMIN: '4'
}

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      const holderShop = await shopModel.findOne({ email }).lean();
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
          publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
          },
          privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
          }
        })

        const publicKeyString = await keyTokenService.createKeyToken({ userId: newShop._id, publicKey , privateKey});

        if (!publicKeyString) {
          return {
            code: 'xx',
            message: 'Error creating key token',
            status: 'error'
          }
        }

        const publicKeyObject = crypto.createPublicKey(publicKeyString);
        const tokens = await createTokenPair( { userId: newShop._id, email }, publicKeyObject, privateKey );
        return {
          code: 201,
          metadata: {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
            tokens}
        }
      }

      return {
        code: 200,
        metadata: null
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