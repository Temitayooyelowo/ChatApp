exports = module.exports = function(io, sharedsession){

  const moment = require('moment');
  const {User_DB} = require('../../db/models/User-db');
  const {ChatRoom} = require('../../db/models/chatRoom');
  const {Messages} = require('../../db/models/Messages');

  io.use(sharedsession);

  io.on('connection', (socket) => {

    socket.on('join', (room, callback) => {

        if(!socket.handshake.session.passport){
          socket.emit('redirectUser');
          return;
        }
        const id = socket.handshake.session.passport.user;

        let userName;
        let doesOldUserExist = ChatRoom.findExistingUser(id, room, function(err, list){
          if(err){
            console.error(err);
          }

          if(list){
            return list.isOld;
          }

          return false;

        });

        let formattedTime = moment().format('LT');

        User_DB.findById(id).then((user) => {
          userName = user.user.name;

          console.log("User is", JSON.stringify(user,undefined,2));

          if(!user){
            console.log("User does not exist");
            callback();
          }

          //if the user already exists then the user has to have been in a room before
          //we need to check if the person is in the old chat room

          //Old chat room is the same with new chat room. Do nothing
          if(doesOldUserExist){

            if(oldChatRoom === room){
              console.log("Oldchatroom and new chat room are the same. Do nothing.");
              callback();
            }

            //User only leaves the old chat room if they click the leave chat room button
          }
          console.log('User did not belong to a previous chat room');

          User_DB.addRoom(id, room, function(error){
            if(error){
              throw error;
            }

            socket.join(room);

            User_DB.getOnlineRoomUsers(room, function(err, userList){
              console.log("Userlist is: ", userList);
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

               ChatRoom.findChatRooms(function(err, roomList) {
                 console.log("In server.js line 211 foom list ", roomList);
                 my_Rooms = roomList;
                 console.log(`Room List: ${my_Rooms}`);
                 io.emit('updateList', {
                    reason: 'updateRoomList',
                    list: roomList
                  });

                  console.log("I'm here");
                  Messages.findAllMessages(room).then((messages) => {
                    callback(null, messages);
                  });

               });
            });

          });

        }).catch((e) => {
          console.log("An error occured while trying to find the user in the database");
          throw e;
        });

        // User_DB.getOnlineRoomUsers(room, function(err, userList){
        //   console.log("userlist2 is ", userList);
        // });

        // //Find records without the same facebook id and the same room
        // User_DB.findOne({'_id': {$ne: id}, 'chatRoom': room}).then((user) =>{
        //   if(user){
        //     return callback(`${userName} already exists in ${room} chatroom.`)
        //   }
        // }).catch((e) => {
        //   console.log('Error when trying to find out if the user already exists in a room');
        //   throw e;
        // });


    });

    socket.on('createMessage', (message, callback)  => {
      const id = socket.handshake.session.passport.user;

      let user = User_DB.getUser(id, function(err, user) {
        console.log(`Message has been received by server and is being broadcasted: ${message.text} from room ${message.chatRoom}`);
        if(err){
          callback(err);
        }

        Messages.addMessage(user.user.id, user.user.name, message.chatRoom, message.text, function(err){

          if(err){
            throw err;
          }
          console.log("Message has been added to the database");
          io.to(message.chatRoom).emit('broadcastMessage', {
            text: message.text,
            user: user.user.name
          });

          callback();
        });

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

        //User doesn't leave the chat room when they logoff. They only leave if they press the leave chatroom button.

        let userRooms = ChatRoom.findChatRoomsForUser;

        for(let i=0; i<userRooms.length; i++){

          User_DB.getOnlineRoomUsers(userRooms[i], function(err, userList){
            if(err){
              throw err;
            }

            io.to(userRooms[i]).emit('updateList', {
               reason: 'updateUserList',
               list: userList
             });
           });

        }

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
