const jwt = require("jsonwebtoken");
const refreshModel = require("../models/refresh-model");
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, accessTokenSecret, {
      expiresIn: "1h",
    });

    const refershToken = jwt.sign(payload, refreshTokenSecret, {
      expiresIn: "1y",
    });

    return { accessToken, refershToken };
  }

  async storeRefreshToken(userId, token) {
    try {
      await refreshModel.create({
        token,
        userId,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async verifyAccessToken(accessToken) {
    return jwt.verify(accessToken, accessTokenSecret);
  }
}
module.exports = new TokenService();
