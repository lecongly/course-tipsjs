/* eslint-disable node/no-unsupported-features/node-builtins */
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const shopModel = require('../models/shop.model');
const keyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response');
const { findByEmail } = require('./shop.service');

const ShopRoles = {
  SHOP: '1',
  WRITER: '2',
  EDITOR: '3',
  ADMIN: '4'
};

class AccessService {
  static async signUp({ name, email, password }) {
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError('Email already exists');
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
      });

      const publicKeyString = await keyTokenService.createKeyToken({ userId: newShop._id, publicKey, privateKey });

      if (!publicKeyString) {
        throw new BadRequestError('Error creating key token');
      }

      const publicKeyObject = crypto.createPublicKey(publicKeyString);

      const tokens = await createTokenPair({ userId: newShop._id, email }, publicKeyObject, privateKey);
      return {
        code: 201,
        metadata: {
          shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
          tokens
        }
      };
    }

    return {
      code: 200,
      metadata: null
    };
  }

  static async login({ email, password }) {
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
    });

    const { _id: userId } = foundShop;

    const tokens = await createTokenPair({ userId, email }, publicKey, privateKey);

    await keyTokenService.createKeyToken({ userId, publicKey, privateKey, refreshToken: tokens.refreshToken });

    return {
      shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
      tokens
    };
  }

  static async logout(keyStore) {
    const delKey = await keyTokenService.removeByKeyId(keyStore);
    return delKey;
  }

  static async handlerRefreshToken({ refreshToken, keyStore, user }) {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await keyTokenService.removeByUserId(userId);
      throw new ForbiddenError('Refresh token has been used, pls login again');
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError('Invalid refresh token');
    }

    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError('Invalid refresh token');
    }

    // Create new tokens
    const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey);

    await keyStore.updateOne({ $set: { refreshToken: tokens.refreshToken }, $addToSet: { refreshTokensUsed: refreshToken } });

    return {
      user,
      tokens
    };
  }
}

module.exports = AccessService;
