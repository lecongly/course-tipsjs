const JWT = require('jsonwebtoken');

const createTokenPair = (payload, publicKey, privateKey) => {
  const accessToken = JWT.sign(payload, privateKey, { expiresIn: '15m', algorithm: 'RS256' });
  const refreshToken = JWT.sign(payload, privateKey, { expiresIn: '7d', algorithm: 'RS256' });

  // JWT.verify(accessToken, publicKey, (err, decoded) => {
  //   console.log({ err, decoded });
  // });

  return { accessToken, refreshToken };
}


module.exports = {
  createTokenPair
}