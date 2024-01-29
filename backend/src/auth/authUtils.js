const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');


const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization'
};

const createTokenPair = (payload, publicKey, privateKey) => {
  const accessToken = JWT.sign(payload, privateKey, { expiresIn: '15m', algorithm: 'RS256' });
  const refreshToken = JWT.sign(payload, privateKey, { expiresIn: '7d', algorithm: 'RS256' });

  // JWT.verify(accessToken, publicKey, (err, decoded) => {
  //   console.log({ err, decoded });
  // });

  return { accessToken, refreshToken };
};

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError('Invalid request');
  }

  const keyStore = await findByUserId(userId);
  if (!keyStore) {
    throw new NotFoundError('Not found key store');
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) {
    throw new AuthFailureError('Invalid request');
  }

  try {
    const decoded = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decoded.userId) {
      throw new AuthFailureError('Invalid request');
    }

    req.keyStore = keyStore;
    return next();
  }
  catch (error) {
    throw error;
  }
});


module.exports = {
  createTokenPair,
  authentication
}