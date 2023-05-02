class UserDto {
  _id;
  phone;
  name;
  avatar;
  activated;
  createdAt;
  constructor(user) {
    this._id = user._id;
    this.name = user.name;
    this.avatar = user.avatar ? `${process.env.BASE_URL}${user.avatar}` : null;
    this.activated = user.activated;
    this.createdAt = user.createdAt;
    this.phone = user.phone;
  }
}

module.exports = UserDto;
