const {mongoose} = require('./../mongoose');
const {ChatRoom} = require('./chatRoom');
const moment = require('moment');

const MessageSchema = new mongoose.Schema({
  message_timestamp: Date,
  message_text: String,
  chatRoom: String,
  sender_name: String,
  sender_id: String
});



MessageSchema.statics.addMessage = async function(user_id, user_name, room, text){
  const Messages = this;

  const newMessage = new Messages({
    "message_timestamp": moment().format(),
    "message_text": text,
    "chatRoom": room,
    "sender_name": user_name,
    "sender_id": user_id
  });

  try{
    await newMessage.save();

    return newMessage;
  }catch(e){
    console.log(`Unable to add new message into database`);
    return { error: e.description };
  }
}

MessageSchema.statics.findAllMessages = async function(room){
  const Messages = this;

  try{
    const messagesFromChatRoom = await Messages.find({"chatRoom" : room});
    return messagesFromChatRoom.map(message => ({messageSender: message.sender_name, 
                                                  messageText: message.message_text, 
                                                  messageTimestamp: message.message_timestamp
                                                }));
  }catch(e){
    return {error: e.description};
  }


  return 
}

MessageSchema.statics.deleteEveryMessage = async function(){
  const Messages = this;

  try{
    const messagesFromChatRoom = await Messages.deleteMany({});
   
  }catch(e){
    console.log()
    return {error: e.description};
  }


  return 
}

const Messages = mongoose.model('Messages', MessageSchema);

module.exports = {
  Messages: Messages
};
