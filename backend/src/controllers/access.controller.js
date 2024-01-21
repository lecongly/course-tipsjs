const AccessService = require("../services/access.service");

class AccessController {

  signUp = async (req, res, next) => {
    try {
      console.log(`Sign up`, req.body);
      // await AccessService.signUp(req.body);
      return res.status(201).json({
        code: '201',
        metadata: { userId: 1 }
      })
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AccessController();