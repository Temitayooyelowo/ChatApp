require('../server/config/config');
const {ChatRoom} = require('../server/db/models/chatRoom');
const {User_DB} = require('../server/db/models/User-db');
const {Messages} = require('../server/db/models/Messages');
const moment = require('moment');

// ChatRoom.addRoom("558", "Test", function(err, list){
//   if(err){
//     console.error(err);
//   }
//   console.log("No error occured.");
//   console.log(list.isOld);
//   let roomList = list.users.map((user) => {
//
//     return user.user_id;
//   });
//   console.log(roomList);
// });

// User_DB.getOnlineRoomUsers("Test", function(err, loggedInUsers) {
//   console.log("Logged in users are: ", loggedInUsers);
// });

// User_DB.findRoomsForUser("5b4166f446a103bac09cf971", function(err, loggedInUsers) {
//   console.log("Logged in users are: ", loggedInUsers);
// });

// ChatRoom.findChatRoomsForUser("290", function(err, loggedInUsers) {
//   console.log("Logged in users are: ", loggedInUsers);
// });

// Messages.addMessage("290", "Temitayo", "Test", "Hello", function(err, savedMessage) {
//   console.log("Logged in users are: ", JSON.stringify(savedMessage, undefined,2));
//
//   Messages.findAllMessages("Test").then((foundMessage) => {
//     console.log(`Messages in test chatroom are:`,JSON.stringify(foundMessage, undefined,2));
//
//     let length = foundMessage.length;
//     console.log("Length is ", length);
//
//     for(let i=0; i<length; i++){
//       console.log("Message_text: " + foundMessage[i].message_text);
//       console.log("Sender_name: " + foundMessage[i].sender_name);
//       console.log("Timestampt: " + foundMessage[i].message_timestamp)
//     };
//   }).catch((e) => {
//     console.log("Error finding messages")
//   });
//
// });


// ChatRoom.findChatRooms(function(err, chatrooms) {
//   console.log("Chat rooms are: ", chatrooms);
// });


// ChatRoom.findExistingUser("558", "Test", function(err, list){
//   if(err){
//     console.error(err);
//   }
//   // console.log("No error occured.");
//   console.log(list.isOld);
//   let roomList = list.users.map((user) => {
//
//     return user.user_id;
//   });
//   console.log(roomList);
// });
