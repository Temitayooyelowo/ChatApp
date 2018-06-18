// const mongoose = require('mongoose');
//
// let UserSchema = new mongoose.Schema({
//   name: String,
//   room: String
// });
//
// UserSchema.statics.findByNameAndEmail = function (name, room) {
//   let User = this; //model is the this binding
//
//   return User.findOne({'name': name, 'room': room});
// };
//
// UserSchema.statics.saveUser = function(){
//   let user = this;
//
//   return user.save();
// }
//
// let User = mongoose.model('Users', UserSchema);

class User {
  constructor(){
    this.users = [];
  }

  addUsers(id, room, name) {
    let user = this.getUserByName(name);

    if(user !== undefined && user.room === room){
      return false;
    }

    let newUser = {
      id: id,
      room: room,
      name: name
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
      return user.id == id;
    });

    return user[0];
  }

  removeUser(id) {
    let removedUser = this.getUser(id);

    if (removedUser) {
      this.users = this.users.filter((user) => {
        return user.id !== id;
      });
    }

    return removedUser;
  }

  getRoomUsers(room){
    //return the users in the room
    let userList = this.users.filter((user) => {
      return user.room === room;
    });

    //return an array of the names of the users in the room
    let userNameList = userList.map((user) => {
      return user.name;
    });

    return userNameList;
  }

}

module.exports = {
  User: User
};
