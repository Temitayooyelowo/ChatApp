require('../../config/config');  //configure environmental variablessss
const should = require('chai').should(); // Using Should style

const { User_DB } = require('../../db/models/User-db');
const { Messages } = require('../../db/models/Messages')
const { USER_WITHOUT_EMAIL, USER_WITH_EMAIL, ACCESS_TOKEN, CHATROOM_INITIAL, CHATROOM_TEST_NAME, TEST_MESSAGE_TEXT } = require('../userConstants');

describe('Message Database Test Suite', () => {
    let userId, userName;

    before(async () => {
        const user = await User_DB.addUserToDatabase(USER_WITH_EMAIL, ACCESS_TOKEN);
        userId = user.user.id;
        userName = user.user.name;
        await User_DB.addRoom(userId, CHATROOM_TEST_NAME);
    });

    after(async () => {
        await User_DB.deleteUser(userId);
    });

    it('Test 2.1.0 - It should save a new message to the database', async() => {
        const addedMessage = await Messages.addMessage(userId, userName, CHATROOM_TEST_NAME, TEST_MESSAGE_TEXT[0]);

        addedMessage.message_text.should.equal(TEST_MESSAGE_TEXT[0]);
        addedMessage.chatRoom.should.equal(CHATROOM_TEST_NAME);
        addedMessage.sender_name.should.equal(userName);
        addedMessage.sender_id.should.equal(userId);
    });

    it('Test 2.2.0 - It should findAllMessages ', async() => {
        const secondAddedMessage = await Messages.addMessage(userId, userName, CHATROOM_TEST_NAME, TEST_MESSAGE_TEXT[1]);
        let chatMessages = await Messages.findAllMessages(CHATROOM_TEST_NAME);

        chatMessages = chatMessages.map((message) => message.messageText);

        chatMessages.should.be.an('array').with.length(2).that.includes(TEST_MESSAGE_TEXT[0]);
        chatMessages.should.be.an('array').with.length(2).that.includes(TEST_MESSAGE_TEXT[1]);
    });

    it('Test 2.3.0 - It should delete every message from the database ', async () => {
        await Messages.deleteEveryMessage();
        let chatMessages = await Messages.findAllMessages(CHATROOM_TEST_NAME);

        chatMessages.should.be.an('array').with.length(0)
    })
});