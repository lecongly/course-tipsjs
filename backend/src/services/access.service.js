
const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const keyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError, AuthFailureError } = require('../core/error.response');
const { findByEmail } = require('./shop.service');

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
      throw new BadRequestError('Email already exists')
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

      const publicKeyString = await keyTokenService.createKeyToken({ userId: newShop._id, publicKey, privateKey });

      if (!publicKeyString) {
        throw new BadRequestError('Error creating key token')
      }

      const publicKeyObject = crypto.createPublicKey(publicKeyString);

      const tokens = await createTokenPair({ userId: newShop._id, email }, publicKeyObject, privateKey);
      return {
        code: 201,
        metadata: {
          shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
          tokens
        }
      }
    }

    return {
      code: 200,
      metadata: null
    }
  }

  static login = async ({ email, password }) => {
    const foundShop = await findByEmail({ email });

    if (!foundShop) {
      throw new AuthFailureError('Email or password incorrect');
    }

    const matchPassword = await bcrypt.compare(password, foundShop.password);
    if (!matchPassword) {
      throw new AuthFailureError('Email or password incorrect');
    }

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

    const { _id: userId } = foundShop;

    const tokens = await createTokenPair({ userId, email }, publicKey, privateKey);

    await keyTokenService.createKeyToken({ userId, publicKey, privateKey, refreshToken: tokens.refreshToken });

    return {
      shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
      tokens
    }

  }
}

module.exports = AccessService;