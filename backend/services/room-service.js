const RoomModel = require("../models/room-model");

class RoomService {
  async create(payload) {
    const { topic, roomType, ownerId } = payload;
    const room = await RoomModel.create({
      topic,
      roomType,
      ownerId,
      speakers: [ownerId],
    });
    console.log("--------------------");
    console.log(room);
    console.log("--------------------");
    return room;
  }

  async getAllRooms(types) {
    const rooms = await RoomModel.find({ roomType: { $in: types } })
      .populate("speakers")
      .populate("ownerId")
      .exec();
    // console.log(rooms);
    return rooms;
  }

  async getRoom(roomId) {
    const room = await RoomModel.findOne({ _id: roomId });
    return room;
  }
}
module.exports = new RoomService();
