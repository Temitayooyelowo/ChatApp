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
      let formattedTime = moment().format('LT');

      console.log("Formatted Time: ", formattedTime);
      if(removedUser) {
        let message = `${removedUser.name} has left the ${removedUser.room} chatroom.`;
        socket.broadcast.to(removedUser.room).emit('broadcastMessage', {
          user: 'Admin',
          text: message,
          createdAt: formattedTime
        });

        io.to(removedUser.room).emit('updateList', {
           reason: 'updateUserList',
           list: userList.getRoomUsers(removedUser.room)
         });

         io.emit('updateList', {
            reason: 'updateRoomList',
            list: userList.getRoomList()
          });
      }

      let isUserAdded = userList.addUsers(socket.id, params.room, params.name);

      if(!isUserAdded){
        return callback(`${params.name} already exists in ${params.room} chatroom.`)
      }

      io.to(params.room).emit('updateList', {
         reason: 'updateUserList',
         list: userList.getRoomUsers(params.room)
       });

       io.emit('updateList', {
          reason: 'updateRoomList',
          list: userList.getRoomList()
        });

      //sends to only the owner of the socket
      socket.emit('userConnected', {
        user: 'Admin',
        text: `Welcome to the chat app ${params.name}.`,
        createdAt: formattedTime
      });

      console.log(`Welcome to the chat app ${params.name}.`);
      console.log(`Room List: ${userList.getRoomList()}`);

      //Send to everyone EXCEPT the owner of the socket
      socket.broadcast.to(params.room).emit('userConnected', {
        user: 'Admin',
        text: `${params.name} has joined ${params.room} chatroom.`,
        createdAt: formattedTime
      });

      callback();
  });

  socket.on('createMessage', (message, callback)  => {
    let user = userList.getUser(socket.id);

    console.log(`Message has been received by server and is being broadcasted: ${message.text} from room ${user.room}`);

    io.to(user.room).emit('broadcastMessage', {
      text: message.text,
      user: userList.getUser(socket.id).name
    });

    callback();
  });

  socket.on('disconnect', (callback) => {
    let removedUser = userList.removeUser(socket.id);
    let message = `${removedUser.name} has left the ${removedUser.room} chatroom.`;
    //console.log("Removed User:", JSON.stringify(removedUser, undefined, 2));

    socket.broadcast.to(removedUser.room).emit('broadcastMessage', {
      user: 'Admin',
      text: message,
      createdAt: moment.valueOf()
    });

    io.to(removedUser.room).emit('updateList', {
       reason: 'updateUserList',
       list: userList.getRoomUsers(removedUser.room)
     });

     io.emit('updateList', {
        reason: 'updateRoomList',
        list: userList.getRoomList()
      });

    console.log(message);

  });
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
