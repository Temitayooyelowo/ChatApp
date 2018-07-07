const {mongoose} = require('./../mongoose');

let UserSchema = new mongoose.Schema({
  "chatRoom": String,
  "loggedIn": {
    type: Boolean,
    default: false
  },
  "user.id": String,
  "user.token": String,
  "user.name": String,
  "user.email": String
});

UserSchema.statics.findByNameAndEmail = function (name, room) {
  let User = this; //model is the this binding

  return User.findOne({'name': name, 'room': room});
};

UserSchema.statics.saveUser = function(){
  let user = this;

  return user.save();
}

UserSchema.statics.getUser = function (id, callback) {
  let User = this; //model is the this binding

  return User.findById(id).then((user) => {
    console.log('User has been found');
    callback(null,user);
  }).catch((e) => {
    console.log("Error encountered when finding user");
    callback(e, null);
  });
};

UserSchema.statics.addRoom = function(id, room, callback){
  let User = this;

  User.findByIdAndUpdate(id, {$set: {chatRoom: room}}).then((user) => {
    console.log(`User: ${user.user.name} has been updated and is now added to ${room} chat room`);
    callback(null);
  }).catch((e) => {
    console.log("Error adding user to chat room");
    callback(e);
  })
}

UserSchema.statics.logOffUser = function(id, callback){
  let User = this;

  User.findByIdAndUpdate(id, {loggedIn: false, chatRoom: ""}, {new: true}).then((user) => {
    console.log(`${user.user.name} has been logged out of the chat app`);
    callback(null, user);
  }).catch((e) => {
    console.log("Error logging off user from chat app.");
    callback(e, null);
  })
}

UserSchema.methods.logInUser = function (callback) {
  let user = this;

  user.loggedIn = true;

  user.save().then(() => {
    console.log(JSON.stringify(user,undefined,2));
    // console.log(`${user.user.name} has been logged out of the chat app`);
    callback(null, user);
  }).catch((e) => {
    console.log("Error logging in user from chat app.");
    callback(e, null);
  });
};

UserSchema.statics.getRoomUsers = function (room, callback) {
  let User = this; //model is the this binding

  console.log("In the getRoomUsers method");
  User.find({chatRoom : room, loggedIn: true}).then((docs) => {
    console.log("Room is " + room);
    let userList = docs.map((user) => {
      return user.user.name;
    });
    console.log("User list is : ", JSON.stringify(userList,undefined,2));
    // return docs;
    callback(null,userList);
  }).catch((e) => {
    console.log("Error when trying to find all users in a chat room");
    callback(e, null);
  });
}

UserSchema.statics.getRoomList = function (callback) {
  let User = this;

  User.find({loggedIn: true}).then((docs) => {
    console.log("In the getRoomList method");

    let roomList = docs.map((user) => {
      return user.chatRoom;
    });

    let roomNameList = roomList.filter((room, index, arr) => {
      return arr.indexOf(room) === index; //if the value is not first occuring then it must be a duplicate
    });

    console.log(roomNameList);

    callback(null, roomNameList);

  }).catch((e) => {
    console.log("Error when trying to find all the available rooms");
    callback(e, null);
  });
}

UserSchema.statics.deleteUser = function (id, callback) {
  let User = this;

  User.findByIdAndRemove(id).then((user) => {
    console.log("User has been deleted from the database");

    callback(null, user);
  }).catch((e) => {
    console.log("Error encountered when trying to delete a user from the database");
    callback(e, null);
  })
}

let User_DB = mongoose.model('Users', UserSchema);

module.exports = {
  User_DB: User_DB
};
