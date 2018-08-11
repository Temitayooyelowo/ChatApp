'use strict';

exports = module.exports = function(io, sharedsession){

  const moment = require('moment');
  const {User_DB} = require('../../db/models/User-db');
  const {ChatRoom} = require('../../db/models/chatRoom');
  const {Messages} = require('../../db/models/Messages');

  io.use(sharedsession);

  io.on('connection', (socket) => {

    socket.on('join', async (chatRoom, callback) => {
      let formattedTime = moment().format('LT');

      if(!socket.handshake.session.passport){
        socket.emit('redirectUser');
        return;
      }

      const userId = socket.handshake.session.passport.user;

      /** check if user exists in room */
      const doesUserAlreadyExistInRoom = await ChatRoom.findExistingUser(userId, chatRoom);
      const newUser = await User_DB.getUser(userId);
      const newUserName = newUser.user.name;

      await User_DB.addRoom(userId, chatRoom);
      socket.join(chatRoom);
      const onlineRoomUsers = await User_DB.getOnlineUsersInRoom(chatRoom);

      io.to(chatRoom).emit('updateList', {
        reason: 'updateUserList',
        list: onlineRoomUsers
      });

      /** sends welcome message to only the owner of the websocket */
      socket.emit('userConnected', {
        user: 'Admin',
        text: `Welcome to the chat app ${newUserName}.`,
        createdAt: formattedTime
      });

      //Send to everyone EXCEPT the owner of the socket
      socket.broadcast.to(chatRoom).emit('userConnected', {
        user: 'Admin',
        text: `${newUserName} has joined ${chatRoom} chatroom.`,
        createdAt: formattedTime
      });

      const chatRoomList = await ChatRoom.findAllChatRooms();
      io.emit('updateList', {
        reason: 'updateRoomList',
        list: chatRoomList
      });

      let chatMessages = await Messages.findAllMessages(chatRoom);

      callback(null, chatMessages);
    });

    socket.on('createMessage', async (message, callback)  => {
      const userId = socket.handshake.session.passport.user;
      const user = await User_DB.getUser(userId);

      if(!user){
        console.log('Can\'t find user in the database');
        return;
      }

      console.log(`Message has been received by server and is being broadcasted: ${message.text} from room ${message.chatRoom}`);
      
      const addedMessage = await Messages.addMessage(userId, user.user.name,  message.chatRoom, message.text);

      io.to(message.chatRoom).emit('broadcastMessage', {
        text: message.text,
        user: user.user.name
      });

      callback();
    });

    socket.on('disconnect', async (callback) => {
      if(!socket.handshake.session.passport){
        socket.emit('redirectUser');
        return;
      }

      const userId = socket.handshake.session.passport.user;

      /** User doesn't leave the chat room when they logoff. They only leave if they press the leave chatroom button. */
      const loggedOffUser = await User_DB.logOffUser(userId);

      const chatRoomsForLoggedOffUser = await ChatRoom.findChatRoomsForUser(userId);

      for (const room of chatRoomsForLoggedOffUser) {
        let onlineUsersInRoom = await User_DB.getOnlineUsersInRoom(room);
        io.to(room).emit('updateList', {
          reason: 'updateUserList',
          list: onlineUsersInRoom
        });
      }

      const chatRoomList = await ChatRoom.findAllChatRooms();
      io.emit('updateList', {
        reason: 'updateRoomList',
        list: chatRoomList
      });
    });

  });
}
