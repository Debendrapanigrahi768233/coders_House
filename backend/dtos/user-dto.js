class UserDto {
  id;
  phone;
  name;
  avatar;
  activated;
  createdAt;
  constructor(user) {
    this.id = user._id;
    this.name = user.name;
    this.avatar = user.avatar;
    this.activated = user.activated;
    this.createdAt = user.createdAt;
    this.phone = user.phone;
  }
}

module.exports = UserDto;
