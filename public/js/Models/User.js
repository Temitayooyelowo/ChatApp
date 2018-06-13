const mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
  name: String,
  room: String
});

UserSchema.statics.findByNameAndEmail = function (name, room) {
  let User = this; //model is the this binding

  return User.findOne({'name': name, 'room': room});
};

UserSchema.statics.saveUser = function(){
  let user = this;

  return user.save();
}

// user.save().then((doc) => {
//   //res.send(doc);
//   console.log("User has been added to the database");
// }).catch((e) => {
//   console.log('Unable to insert user into ' + dbName + '. ' + e);
//   //res.status(400).send(e);
// });

let User = mongoose.model('Users', UserSchema);


module.exports = {
  User: User
};
