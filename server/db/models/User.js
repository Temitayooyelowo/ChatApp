class User {
  constructor(){
    this.users = [];
  }

  addUsers(socketId, room, name, facebookId) {
    let user = this.getUserByName(name);

    if(user !== undefined && user.room === room){
      return false;
    }

    let newUser = {
      socketId: socketId,
      room: room,
      name: name,
      facebookId: facebookId
    }

    this.users.push(newUser);

    return true;
  }

  getUserByName(name){
    let user = this.users.filter((user) => {
      return user.name == name;
    });

    return user[0];
  }

  getUser(id) {

    let user = this.users.filter((user) => {
      return user.socketId == id;
    });

    return user[0];
  }

  removeUser(id) {
    let removedUser = this.getUser(id);

    if (removedUser) {
      this.users = this.users.filter((user) => {
        return user.socketId !== id;
      });
    }

    return removedUser;
  }

  getRoomUsers(room){
    //return the users in the room
    let userList = this.users.filter((user) => {
      console.log(JSON.stringify(user,undefined,2));
      return user.room === room;
    });

    //return an array of the names of the users in the room
    let userNameList = userList.map((user) => {
      return user.name;
    });

    return userNameList;
  }

  getRoomList(){
    let roomList = this.users.map((user) => {
      return user.room;
    });

    let roomNameList = roomList.filter((room, index, arr) => {
      return arr.indexOf(room) === index; //if the value is not first occuring then it must be a duplicate
    });

    return roomNameList;
  }

}

module.exports = {
  User: User
};
