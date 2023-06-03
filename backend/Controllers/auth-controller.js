const otpService = require("../services/Otp-service");
const hashService = require("../services/hash-service");
const userService = require("../services/user-service");
const tokenService = require("../services/token-service");

const userDto = require("../dtos/user-dto");
const userModel = require("../models/user.model");

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
    if (!otp || !hash || !phone) {
      res.status(400).json({ message: "All fields are required!" });
    }
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
    const { accessToken, refreshToken } = tokenService.generateTokens({
      _id: user._id,
      activated: false,
    });

    await tokenService.storeRefreshToken(user._id, refreshToken);

    //We store refresh token in cookie and in db , so that when user logout we can delete the ref token from database
    res.cookie("refreshToken", refreshToken, {
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

  async refresh(req, res) {
    //get refresh token from cookie
    console.log(
      "------------------------------------In Refresh--------------------------------------"
    );
    const { refreshToken: refreshTokenFromCookie } = req.cookies;
    //check if token is valid
    console.log(refreshTokenFromCookie);
    let userdata;
    try {
      userdata = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
      console.log(userdata);
    } catch (err) {
      return res.status(401).json({ message: "Invalid Token" });
    }
    //check if token is in db
    try {
      const token = await tokenService.findRefreshToken(
        userdata._id,
        refreshTokenFromCookie
      );
      if (!token) {
        return res.status(401).json({ message: "invalid token" });
      }
    } catch (err) {
      return res.status(500).json({ message: "Not found in Db" });
    }
    //check if valid user
    const user = await userModel.findOne({ _id: userdata._id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    //generate new tokens
    const { accessToken, refreshToken } = tokenService.generateTokens({
      _id: userdata._id,
    });
    //Update refresh token
    try {
      const refreshTokenNew = await tokenService.updateRefreshToken(
        userdata._id,
        refreshToken
      );
    } catch (err) {
      return res.status(500).json({ message: "some db error" });
    }
    //put in cookie
    //We store refresh token in cookie and in db , so that when user logout we can delete the ref token from database
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    //We store access token in cookie without storing them on localStorage for security reasons
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    console.log(
      "------------------------------------Out Refresh--------------------------------------"
    );
    const userdto = new userDto(user);

    res.json({ user: userdto, auth: true });
    //send response
  }

  async logout(req, res) {
    //Delete the refresh token from the Cookie
    const { refreshToken } = req.cookies;
    await tokenService.deleteRefreshToken(refreshToken);
    //Clear the cookie(delete)
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.json({ user: null, auth: false });
  }
}

//We are exporting the new object we created for the class
//This is the singleton pattern as whenever we require this it will send the same object without creating multiple one.
module.exports = new AuthController();
