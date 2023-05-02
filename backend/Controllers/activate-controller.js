const Jimp = require("jimp");
const path = require("path");
const userService = require("../services/user-service");
const UserDto = require("../dtos/user-dto");

class ActivateController {
  //this is class method
  async activate(req, res) {
    //activation logic
    const { name, avatar } = req.body;
    if (!name || !avatar) {
      res.status(400).json({ message: "all fields are required" });
    }
    //Image buffer
    const buffer = Buffer.from(
      avatar.replace(/^data:image\/(png|jpeg|jpg);base64,/, ""),
      "base64"
    );

    const imgpath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
    console.log(imgpath);
    try {
      const jimpres = await Jimp.read(buffer);
      jimpres
        .resize(150, Jimp.AUTO)
        .write(path.resolve(__dirname, `../storage/${imgpath}`));
    } catch (err) {
      res.status(500).json({ message: "could not process image" });
    }

    const userId = req.user._id;
    console.log("userId", userId);
    try {
      console.log("here");
      //   const user = await userService.findUser({ _id: userId });
      const user = await userService.findUser({ _id: userId });
      console.log("here2");
      console.log(user);
      if (!user) {
        res.status(404).json({ message: "user not found!" });
      }
      user.activated = true;
      user.name = name;
      user.avatar = `/storage/${imgpath}`;
      user.save();
      res.json({ user: new UserDto(user), auth: true });
    } catch (err) {
      res
        .status(500)
        .json({ message: "some db error happened in saving the user" });
    }
  }
}

module.exports = new ActivateController();
