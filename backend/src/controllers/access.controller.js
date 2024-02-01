const { CREATED, SuccessResponse } = require('../core/success.response');
const AccessService = require('../services/access.service');

const signUp = async (req, res, next) => {
  new CREATED({ message: 'User created', metadata: await AccessService.signUp(req.body) }).send(res);
};

const login = async (req, res, next) => {
  new SuccessResponse({ metadata: await AccessService.login(req.body) }).send(res);
};

const logout = async (req, res, next) => {
  new SuccessResponse({ message: 'Logout success', metadata: await AccessService.logout(req.keyStore) }).send(res);
};

const handlerRefreshToken = async (req, res, next) => {
  new SuccessResponse({
    message: 'Get token success',
    metadata: await AccessService.handlerRefreshToken({
      keyStore: req.keyStore,
      refreshToken: req.refreshToken,
      user: req.user
    })
  }).send(res);
};

module.exports = {
  signUp,
  login,
  logout,
  handlerRefreshToken
};
