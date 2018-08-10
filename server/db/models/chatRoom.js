console.log('In chatroom.js');
const {mongoose} = require('./../mongoose');
const moment = require('moment');

const ChatRoomSchema = new mongoose.Schema({
  "chatRoom_name": String,
  "users": [{"user_id": String, "joined_at": String}]
});

ChatRoomSchema.statics.addUserToRoom = async function(user_id, room){
  const ChatRoom = this;

  try{
    const chatroom = await ChatRoom.findOne({"chatRoom_name": room});
    /** Chatroom is not found so a new chatroom is created */
    if(!chatroom){

      try{
        const newChatRoom = new ChatRoom({
          "chatRoom_name": room,
          "users": [{"user_id": user_id, "joined_at": moment().format('LT')}]
        });
    
        const savedNewChatRoom = await newChatRoom.save();
        return { users: savedNewChatRoom.users};

      }catch(e){
        console.log("An error occured");
        throw e;
      }

    }

    try{
      /** Chatroom exists */

      const existingRoom = await ChatRoom.findExistingUser(user_id, room);
      if(!!existingRoom){ 
        /** User already belongs to chatroom so chatroom is not modified and returns false */
        return false;
      }
    
      /** User does not exist in chatroom */
      chatroom.users.push({"user_id": user_id, "joined_at": moment().format('LT')});
      await chatroom.save();
      return { users: chatroom.users };
    }catch(e){
      throw e;
    }
  }catch(e){
    console.log("Error adding chatroom");
    return {
      error: e.description
    }
  }
}

ChatRoomSchema.statics.findExistingUser = async function (user_id, room) {
  const ChatRoom = this;

  try{
    const chatroom = await ChatRoom.findOne({"chatRoom_name": room, "users.user_id": user_id }, {"users": {$elemMatch: {"user_id": user_id}} });

    if(!!chatroom){
      return chatroom.users ? { users: chatroom.users } : undefined;
    }
    return false;
  }catch(e){
    return {error: e.description};
  }
}

ChatRoomSchema.statics.findChatRoomsForUser = async (user_id) => {
  try{
    const chatrooms = await ChatRoom.find({"users.user_id": user_id}, {'_id': 0, '__v': 0, 'users': 0 });

    if(!!chatrooms){
      /** Existing User has been found */
      const filteredChatRooms = chatrooms.map(rooms => rooms.chatRoom_name);
      return (filteredChatRooms) ? filteredChatRooms : undefined;
    }
  }catch(e){
    return { error: e.description } //roomList is undefined by default when not passed in
  }
}

ChatRoomSchema.statics.findAllUsersInChatRoom = async (room) => {
  try{
    const foundUsersInChatRoom = await ChatRoom.findOne({"chatRoom_name": room}, {'_id': 0, '__v': 0, 'chatRoom_name': 0 });

    if(foundUsersInChatRoom && foundUsersInChatRoom.users){
      const mappedUsers = foundUsersInChatRoom.users.map((user) => user.user_id);
      return (mappedUsers) ? mappedUsers : undefined;
    }
    return [];
  }catch(e){
    console.log("An error occured");
    return { error: e.description }
  }
}

ChatRoomSchema.statics.findAllChatRooms = async () => {
  try{
    const allChatrooms = await ChatRoom.find({}, {'_id': 0, '__v': 0, 'users': 0 });

    if(allChatrooms){
      const nameOfChatRooms = allChatrooms.map(chatroom => chatroom.chatRoom_name);
      return (nameOfChatRooms) ? nameOfChatRooms : undefined;
    }
  }catch(e){
    return {error: e.description};
  }
}

ChatRoomSchema.statics.deleteUserFromEveryChatRoom = async (id) => {
  try{
    const updatedChatRoom = await ChatRoom.updateMany( {}, { $pull: {"users": {"user_id": id} }}, {new: true} )

    return (!!updatedChatRoom) ? updatedChatRoom : undefined;
  }catch(e){
    return {error: e.description};
  }
}

ChatRoomSchema.statics.deleteEveryChatRoom = async () => {
  try{
    await ChatRoom.deleteMany({});

  }catch(e){
    console.log("An error occured when deleting all chatrooms ");
    return {error: e.message}
  }
}

const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);

module.exports = {
  ChatRoom: ChatRoom
};
