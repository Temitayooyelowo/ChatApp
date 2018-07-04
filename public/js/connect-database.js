'use strict';
// const {MongoClient} = require('mongodb');
const mongoose = require('mongoose');

const {mongoose} = require('./db/mongoose');
const {User} = require('./Models/User');

//Use connect method to connect to the Server
mongoose.connect(process.env.MONGODB_URI);

const name = 'Temitayo Oyelowo';
const room = 'Test';
let user = new User({
  name: name,
  room: room
});

user.save().then((doc) => {
  //res.send(doc);
  console.log("User has been added to the database");
}).catch((e) => {
  console.log('Unable to insert user into ' + dbName + '. ' + e);
  //res.status(400).send(e);
});

User.find({name: 'Temitayo Oyelowo'}).then((docs) => {

  let docLength = docs.length;

  if(docLength !== 0){
    console.log(`${docLength} user(s) exist in the database.`);
    return `${docLength} user(s) exist in the database.`;
  }

  console.log(`User does not exist in the database`);
  return `User does not exist in the database`;
}).catch((err) => {
  console.log(`Unable to fetch users from ${dbName} database. ${err}`);
  return `Unable to fetch users from ${dbName} database. ${err}`;
});

User.findOne({name: 'Temitayo Oyelowo'}).then((doc) => {

  if(doc){
    console.log(`${doc.name} exists in ${dbName} database.`);
    return `${doc.name} exists in ${dbName} database.`;
  }

  console.log(`User does not exist in the database`);
  return `User does not exist in the database`;
}).catch((err) => {
  console.log(`Unable to fetch users from ${dbName} database. ${err}`);
  return `Unable to fetch users from ${dbName} database. ${err}`;
});

User.findOneAndRemove({name: 'Temitayo Oyelowo'}).then((user) => {
  if(!user){
    console.log("Document not found.")
    //return res.status(404).send('Document not found');
  }

  console.log(`${user.name} has been removed. from ${dbName} database.`);
//  res.status(200).send({user});
}).catch((e) => {
  console.log("Document not removed.", e);
  //res.status(400).send(e);
});




  // db.collection('Users').find({
  //   name: 'Temitayo Oyelowo'
  // }).toArray().then((docs) => {
  //
  //   if(docs.length === 0){
  //     return console.log("Name is valid");
  //   }
  //
  //   console.log("Name is invalid");
  //
  // }, (err) => {
  //   console.log('Unable to fetch users from the database', err);
  // });
  //
  // db.collection('Users').findOneAndDelete({
  //   name: 'Temitayo Oyelowo'
  // }).then((result) => {
  //
  //   console.log(JSON.stringify(result, undefined, 2));
  // }).catch((e) => {
  //   console.log('Unable to delete document', e);
  // });
