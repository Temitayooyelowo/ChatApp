const express = require('express');
const path = require('path');
const _ = require('lodash');
const http = require('http'); //built in node module
const socketIO = require('socket.io');

const {mongoose} = require('./db/mongoose');
const {User} = require('../public/js/Models/User');

const app = express();
const server = http.createServer(app); // http server instead of express server
const io = socketIO(server);

const dbName = 'ChatApp';
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/chat', (req, res) => {
  let body = _.pick(req.query, ['name', 'room']);
  let name = body.name;
  let room = body.room;

  res.sendFile(path.join(__dirname, '../public', 'chat.html'));

  // User.findByNameAndEmail(name, room).then((user) => {
  //
  //   if(user) {
  //     console.log(`A user with name ${name} already exists in ${room} room.`);
  //     return res.status(400).send(`A user with this name already exists in ${room} room.`);
  //   }
  //
  //   let newUser = new User({name: name, room: room});
  //
  //   newUser.save().then((doc) => {
  //     console.log("User has been added to the database");
  //     res.sendFile(path.join(__dirname, '../public', 'chat.html'));
  //   }).catch((e) => {
  //     console.log('Unable to insert user into ' + dbName + '. ' + e);
  //     res.status(400).send(e);
  //   });
  //
  // }).catch((e) => {
  //   console.log(`Unable to insert user into ${dbName} ${e}`);
  //   return res.status(400).send(`Unable to insert user into ${dbName} ${e}`);
  // });
});

io.on('connection', (socket) => {
  console.log("A user connected");

  socket.on('createMessage', (message, callback) => {

    console.log(`New message is ${message.text}`);

    callback();
    // socket.emit('generateNewMessage', () => {
    //
    // });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});


server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
