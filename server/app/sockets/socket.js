exports = module.exports = function(io, sharedsession){

  const moment = require('moment');
  const {User_DB} = require('../../db/models/User-db');

  io.use(sharedsession);

  io.on('connection', (socket) => {

    socket.on('join', (room, callback) => {

        if(!socket.handshake.session.passport){
          socket.emit('redirectUser');
          return;
        }
        const id = socket.handshake.session.passport.user;

        let userName;
        let oldChatRoom = "";
        let formattedTime = moment().format('LT');

        User_DB.findById(id).then((user) => {
          userName = user.user.name;
          oldChatRoom = user.chatRoom;

          console.log("User is", JSON.stringify(user,undefined,2));

          if(!user){
            console.log("User does not exist");
            callback();
          }

          if(oldChatRoom){

            if(oldChatRoom === room){
              console.log("Oldchatroom and new chat room are the same. Do nothing.");
              callback();
            }

            console.log("Old chat room exists");
            let tempMessage = `${user.user.name} has left the ${user.chatRoom} chatroom.`;
            socket.broadcast.to(oldChatRoom).emit('broadcastMessage', {
              user: 'Admin',
              text: tempMessage,
              createdAt: formattedTime
            });

            User_DB.getRoomUsers(room, function(err, userList){
              io.to(room).emit('updateList', {
                 reason: 'updateUserList',
                 list: userList
               });
            });

            User_DB.getRoomList(function(err, roomList){
              io.emit('updateList', {
                 reason: 'updateRoomList',
                 list: roomList
               });
            });

            let message = `${userName} has left the ${oldChatRoom} chatroom.`;

            user.chatRoom = room;
          }
          console.log('User did not belong to a previous chat room');

          User_DB.addRoom(id, room, function(error){
            if(error){
              throw error;
            }

            socket.join(room);

            User_DB.getRoomUsers(room, function(err, userList){
              io.to(room).emit('updateList', {
                 reason: 'updateUserList',
                 list: userList
               });

               //sends to only the owner of the socket
               socket.emit('userConnected', {
                 user: 'Admin',
                 text: `Welcome to the chat app ${userName}.`,
                 createdAt: formattedTime
               });

               //Send to everyone EXCEPT the owner of the socket
               socket.broadcast.to(room).emit('userConnected', {
                 user: 'Admin',
                 text: `${userName} has joined ${room} chatroom.`,
                 createdAt: formattedTime
               });
            });

            User_DB.getRoomList(function(err, roomList){
              console.log("In server.js line 211 foom list ", roomList);
              my_Rooms = roomList;
              console.log(`Room List: ${my_Rooms}`);
              io.emit('updateList', {
                 reason: 'updateRoomList',
                 list: roomList
               });
            });

          });

        }).catch((e) => {
          console.log("An error occured while trying to find the user in the database");
          throw e;
        });

        //Find records without the same facebook id and the same room
        User_DB.findOne({'_id': {$ne: id}, 'chatRoom': room}).then((user) =>{
          if(user){
            return callback(`${userName} already exists in ${room} chatroom.`)
          }
        }).catch((e) => {
          console.log('Error when trying to find out if the user already exists in a room');
          throw e;
        });

        callback();
    });

    socket.on('createMessage', (message, callback)  => {
      const id = socket.handshake.session.passport.user;
      let user = User_DB.getUser(id, function(err, user) {
        console.log(`Message has been received by server and is being broadcasted: ${message.text} from room ${user.chatRoom}`);
        if(err){
          callback(err);
        }

        io.to(user.chatRoom).emit('broadcastMessage', {
          text: message.text,
          user: user.user.name
        });

        callback();
      });
    });

    socket.on('disconnect', (callback) => {
      if(!socket.handshake.session.passport){
        socket.emit('redirectUser');
        return;
      }

      const id = socket.handshake.session.passport.user;

      User_DB.logOffUser(id, function(err, loggedOffedUser){
        if(err){
          console.log("An error was encountered when logging off the user. Please check logs for details.");
          throw err;
        }

        let message = `${loggedOffedUser.user.name} has left the ${loggedOffedUser.chatRoom} chatroom.`;
        console.log("Removed User:", JSON.stringify(loggedOffedUser, undefined, 2));

        socket.broadcast.to(loggedOffedUser.room).emit('broadcastMessage', {
          user: 'Admin',
          text: message,
          createdAt: moment.valueOf()
        });

        User_DB.getRoomUsers(loggedOffedUser.chatRoom, function(err, userList){
          if(err){
            throw err;
          }

          io.to(loggedOffedUser.chatRoom).emit('updateList', {
             reason: 'updateUserList',
             list: userList
           });
         });

         User_DB.getRoomList(function(err, roomList){
           if(err){
             throw err;
           }

           console.log("In server.js line 211 foom list ", roomList);
           io.emit('updateList', {
              reason: 'updateRoomList',
              list: roomList
            });
         });

         console.log(message);
      });

    });
  });
}
