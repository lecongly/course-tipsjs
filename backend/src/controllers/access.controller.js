const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  signUp = async (req, res, next) => {
    new CREATED({ message: 'User created', metadata: await AccessService.signUp(req.body) }).send(res);
  }

  login = async (req, res, next) => {
    new SuccessResponse({ metadata: await AccessService.login(req.body) }).send(res);
  }

  logout = async (req, res, next) => {
    new SuccessResponse({ message: 'Logout success', metadata: await AccessService.logout(req.keyStore) }).send(res);
  }
}

module.exports = new AccessController();