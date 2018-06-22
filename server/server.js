const express = require('express');
const path = require('path');
const _ = require('lodash');
const http = require('http'); //built in node module
const socketIO = require('socket.io');

const moment = require('moment');

// const {mongoose} = require('./db/mongoose');
const {User} = require('./models/User');

const app = express();
const server = http.createServer(app); // http server instead of express server
const io = socketIO(server);

const dbName = 'ChatApp';
const port = process.env.PORT || 3000;

const userList = new User();

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

  socket.on('join', (params, callback) => {
      // if(!isRealString(params.name) || !isRealString(params.room)){
      //   return callback('Name and room name are required'); //argument in callback is error argument
      // }

      socket.join(params.room);

      let removedUser = userList.removeUser(socket.id);

      if(removedUser) {
        let message = `${removedUser.name} has left the ${removedUser.room} chatroom.`;
        socket.broadcast.to(removedUser.room).emit('leaveRoom', {
          from: 'Admin',
          text: message,
          createdAt: moment.valueOf()
        });
      }

      let isUserAdded = userList.addUsers(socket.id, params.room, params.name);

      if(!isUserAdded){
        return callback(`${params.name} already exists in ${params.room} chatroom.`)
      }


      io.to(params.room).emit('updateUserList', userList.getRoomUsers(params.room));

      //sends to only the owner of the socket
      socket.emit('userConnected', {
        from: 'Admin',
        text: `Welcome to the chat app ${params.name}.`,
        createdAt: moment.valueOf()
      });

      console.log(`Welcome to the chat app ${params.name}.`);

      //Send to everyone EXCEPT the owner of the socket
      socket.broadcast.to(params.room).emit('userConnected', {
        from: 'Admin',
        text: `${params.name} has joined ${params.room} chatroom.`,
        createdAt: moment.valueOf()
      });

      callback();
  });

  socket.on('createMessage', (message, callback) => {

    console.log(`Message has been received by server and is being broadcasted: ${message.text}`);

    io.emit('broadcastMessage', {
      text: message.text,
      user: userList.getUser(socket.id).name
    });

    callback();
  });

  socket.on('switchRooms', (receivedMessage, callback) => {
    let user = userList.getUser(socket.id);
    let oldRoom = userList.switchRooms(socket.id, receivedMessage);

    let message = `${user.name} has left the ${oldRoom} chatroom.`;

    if(!!oldRoom){
      socket.broadcast.to(oldRoom.room).emit('leaveRoom', {
        from: 'Admin',
        text: receivedMessage,
        createdAt: moment.valueOf()
      });



      callback('Passed');
    }

    callback();

  });

  socket.on('disconnect', (callback) => {
    let removedUser = userList.removeUser(socket.id);
    let message = `${removedUser.name} has left the ${removedUser.room} chatroom.`;
    //console.log("Removed User:", JSON.stringify(removedUser, undefined, 2));

    socket.broadcast.to(removedUser.room).emit('leaveRoom', {
      from: 'Admin',
      text: message,
      createdAt: moment.valueOf()
    });

    io.to(removedUser.room).emit('updateUserList', userList.getRoomUsers(removedUser.room));

    console.log(message);

  });
});



app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});


server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
