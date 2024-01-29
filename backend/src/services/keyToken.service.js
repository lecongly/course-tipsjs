const { Types } = require("mongoose");
const keyTokenModel = require("../models/keyToken.model");

class keyTokenService {

  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      const publicKeyString = publicKey.toString();
      const privateKeyString = privateKey.toString();

      const filter = { user: userId };
      const update = { publicKey: publicKeyString, privateKey: privateKeyString, refreshTokensUsed: [], refreshToken };
      const options = { upsert: true, new: true };

      const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options).lean();

      return tokens ? tokens.publicKey : null;

    } catch (error) {
      return error
    }
  }

  static findByUserId = (userId) => {
    return keyTokenModel.findOne({ user: new Types.ObjectId(userId) }).lean();
  }

  static removeByKeyId = (keyStore) => {
    return keyTokenModel.deleteOne(keyStore).lean();
  }

}

module.exports = keyTokenService;