
const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const keyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError } = require('../core/error.response');

const ShopRoles = {
  SHOP: '1',
  WRITER: '2',
  EDITOR: '3',
  ADMIN: '4'
}

class AccessService {
  static signUp = async ({ name, email, password }) => {
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        throw new BadRequestError('Email already exists' )
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
          throw new BadRequestError('Error creating key token')
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
  }
}

module.exports = AccessService;