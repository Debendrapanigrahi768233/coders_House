const otpService = require("../services/Otp-service");
const hashService = require("../services/hash-service");
const userService = require("../services/user-service");
const tokenService = require("../services/token-service");

const userDto = require("../dtos/user-dto");

class AuthController {
  async sendOtp(req, res) {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phonenumber is not provided" });
    }

    const otp = await otpService.generateOtp();
    const ttl = 1000 * 60 * 2; //2 mins
    const expiresAt = Date.now() + ttl;

    const hashedStr = hashService.hashOtp(`${phone}.${otp}.${expiresAt}`);

    try {
      // await otpService.sendBySms(phone, otp);
      // console.log(hashedStr);
      res.json({
        hash: `${hashedStr}.${expiresAt}`,
        phone: phone,
        otp: otp,
      });
    } catch (err) {
      res.status(500).send(err.message);
    }

    // return res.json({ otp: hashedStr });
  }

  async verifyOtp(req, res) {
    const { otp, hash, phone } = req.body;
    const [actualHash, expiresAt] = hash.split(".");
    if (+expiresAt < Date.now()) {
      res.status(400).json({ message: "otp expired!" });
    }

    const data = `${phone}.${otp}.${expiresAt}`;
    const isValid = otpService.verifyOtp(actualHash, data);
    if (!isValid) {
      res.status(400).json({ message: "invalid otp" });
    }

    let user;

    try {
      user = await userService.findUser({ phone: phone });
      if (!user) {
        user = await userService.createUser({ phone: phone });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }

    //Token
    const { accessToken, refershToken } = tokenService.generateTokens({
      _id: user._id,
      activated: false,
    });

    await tokenService.storeRefreshToken(user._id, refershToken);

    //We store refresh token in cookie and in db , so that when user logout we can delete the ref token from database
    res.cookie("refreshToken", refershToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    //We store access token in cookie without storing them on localStorage for security reasons
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    const userdto = new userDto(user);

    res.json({ user: userdto, auth: true });
  }
}

//We are exporting the new object we created for the class
//This is the singleton pattern as whenever we require this it will send the same object without creating multiple one.
module.exports = new AuthController();
