require('../../config/config');  //configure environmental variablessss
const should = require('chai').should();

const { User_DB } = require('../../db/models/User-db');
const { ChatRoom } = require('../../db/models/chatRoom')
const { USER_WITHOUT_EMAIL, USER_WITH_EMAIL, ACCESS_TOKEN, INVALID_USER_ID, CHATROOM_TEST_NAME, INVALID_CHATROOM_TEST_NAME, SECOND_TEST_CHATROOM } = require('../userConstants');

describe('User Database Test Suite', () => {

    let user_with_email_id, user_without_email_id;

    before(async () => {
        const user_with_email = await User_DB.addUserToDatabase(USER_WITH_EMAIL, ACCESS_TOKEN);
        const user_without_email = await User_DB.addUserToDatabase(USER_WITHOUT_EMAIL, ACCESS_TOKEN);

        user_with_email_id = user_with_email.user.id;
        user_without_email_id = user_without_email.user.id;
    });

    after(async () => {
        await User_DB.deleteUser(user_with_email_id);
        await User_DB.deleteUser(user_without_email_id);
        require('why-is-node-running');
    });

    it('Test 1.1.0 - should add user to a chatroom that does not exist', async () => {
        const users_in_chatroom = await ChatRoom.addUserToRoom(user_with_email_id, CHATROOM_TEST_NAME);

        users_in_chatroom.users.should.be.an('array').with.length(1);
        users_in_chatroom.users[0].user_id.should.equal(user_with_email_id);

    });

    it('Test 1.1.1 - should add user to an existing chatroom', async () => {
        const users_in_chatroom = await ChatRoom.addUserToRoom(user_without_email_id, CHATROOM_TEST_NAME);

        users_in_chatroom.users.should.be.an('array').with.length(2);
        users_in_chatroom.users[1].user_id.should.equal(user_without_email_id);

    });

    it('Test 1.1.2 - should add a user to a chatroom that the user already belongs in', async () => {
        const users_in_chatroom = await ChatRoom.addUserToRoom(user_without_email_id, CHATROOM_TEST_NAME);

        /** User already belongs to chatroom so chatroom was not modified and returns false */
        users_in_chatroom.should.be.false;
    });

    it('Test 1.2.0 - should find a user that already belongs in a chatroom', async () => {
        const foundUser = await ChatRoom.findExistingUser(user_with_email_id, CHATROOM_TEST_NAME);

        foundUser.users.should.be.an('array').with.length(1);
        foundUser.users[0].user_id.should.be.equal(user_with_email_id);
    });

    it('Test 1.2.1 - should find a user that does not belong in a chatroom', async () => {
        const foundUser = await ChatRoom.findExistingUser(INVALID_USER_ID, CHATROOM_TEST_NAME);

        // should.not.exist(foundUser);
        foundUser.should.be.false;
    });

    it('Test 1.3.0 - should find all the rooms a valid user belongs to', async () => {
        const users_in_chatroom = await ChatRoom.addUserToRoom(user_with_email_id, SECOND_TEST_CHATROOM);
        const foundRooms = await ChatRoom.findChatRoomsForUser(user_with_email_id);

        foundRooms.should.be.an('array').with.length(2);
        foundRooms[0].should.be.equal(CHATROOM_TEST_NAME);
    });

    it('Test 1.3.1 - should find the rooms of an invalid user', async () => {
        const foundRooms = await ChatRoom.findChatRoomsForUser(INVALID_USER_ID);

        foundRooms.should.be.an('array').with.length(0);
    });

    it('Test 1.4.0 - should find all the users in a chatroom', async () => {
        const foundRooms = await ChatRoom.findAllUsersInChatRoom(CHATROOM_TEST_NAME);

        foundRooms.should.be.an('array').with.length(2);
        foundRooms.should.include(user_with_email_id);
        foundRooms.should.include(user_without_email_id);
    });

    it('Test 1.4.1 - should find the users in an invalid chatroom', async () => {
        const foundRooms = await ChatRoom.findAllUsersInChatRoom(INVALID_CHATROOM_TEST_NAME);

        foundRooms.should.be.an('array').with.length(0);
    });

    it('Test 1.5.0 - should find all the chat rooms in a database', async () => {
        const foundRooms = await ChatRoom.findAllChatRooms();

        foundRooms.should.be.an('array').with.length(2);
        foundRooms.should.include(CHATROOM_TEST_NAME);
        foundRooms.should.include(SECOND_TEST_CHATROOM);
    });

    it('Test 1.6.0 - should delete a user from a chatroom ', async () => {
        const deletedChatRoom = await ChatRoom.deleteUserFromEveryChatRoom(user_with_email_id);
        const foundRooms  = await ChatRoom.findChatRoomsForUser(user_with_email_id);

        foundRooms.should.be.an('array').with.length(0);
    }); 

    it('Test 1.6.1 - should delete an invalid user', async () => {
        const deletedChatRoom = await ChatRoom.deleteUserFromEveryChatRoom(INVALID_USER_ID);

        deletedChatRoom.nModified.should.be.equal(0);
    }); 

    it('Test 1.7.0 - should delete every chatroom from the database', async () => {
        const deletedChatRoom = await ChatRoom.deleteEveryChatRoom();

        const foundRooms = await ChatRoom.findAllChatRooms();
        foundRooms.should.be.an('array').with.length(0);
    }); 
});