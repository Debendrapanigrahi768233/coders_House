const tokenService = require("../services/token-service");

module.exports = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    console.log(accessToken);
    if (!accessToken) {
      throw new Error();
    }
    const userdata = await tokenService.verifyAccessToken(accessToken);
    console.log(userdata);
    if (!userdata) {
      throw new Error();
    }
    req.user = userdata;
    next();
  } catch (err) {
    res.status(401).json({ message: "invalid token" });
  }
};
