require('../../config/config');  //configure environmental variablessss
const should = require('chai').should(); // Using Should style

const { User_DB } = require('../../db/models/User-db');
const { ChatRoom } = require('../../db/models/chatRoom')
const { USER_WITHOUT_EMAIL, USER_WITH_EMAIL, ACCESS_TOKEN, CHATROOM_INITIAL, CHATROOM_TEST_NAME, INVALID_USER_ID } = require('../userConstants');


describe('User Database Test Suite', () => {
    let user_with_email_id;
    let user_without_email_id;

    it('Test 3.1.0 - should add a user with no email to the database', async () => {
        const addedUser = await User_DB.addUserToDatabase(USER_WITHOUT_EMAIL, ACCESS_TOKEN);
        user_without_email_id = addedUser.user.id;
        
        addedUser.loggedIn.should.be.true;
        addedUser.user.id.should.equal(USER_WITHOUT_EMAIL.id);
        addedUser.user.token.should.equal(ACCESS_TOKEN);
        addedUser.user.name.should.equal(USER_WITHOUT_EMAIL.displayName);
        addedUser.user.email.should.equal(USER_WITHOUT_EMAIL.emails);
        addedUser.chatRoom.should.equal(CHATROOM_INITIAL);
    });

    it('Test 3.1.1 - should add a user with an email to the database ', async() => {
        const addedUser = await User_DB.addUserToDatabase(USER_WITH_EMAIL, ACCESS_TOKEN);
        user_with_email_id = addedUser.user.id;

        addedUser.loggedIn.should.be.true;
        addedUser.user.id.should.equal(USER_WITH_EMAIL.id);
        addedUser.user.token.should.equal(ACCESS_TOKEN);
        addedUser.user.name.should.equal(USER_WITH_EMAIL.displayName);
        addedUser.user.email.should.equal(USER_WITH_EMAIL.emails[0].value);
        addedUser.chatRoom.should.equal(CHATROOM_INITIAL);
    });

    it('Test 3.2.0 - should get a valid user by id', async () => {
        const user = await User_DB.getUser(user_without_email_id);

        user.loggedIn.should.be.true;
        user.user.id.should.equal(USER_WITHOUT_EMAIL.id);
        user.user.token.should.equal(ACCESS_TOKEN);
        user.user.name.should.equal(USER_WITHOUT_EMAIL.displayName);
        user.user.email.should.equal(USER_WITHOUT_EMAIL.emails);
        user.chatRoom.should.equal(CHATROOM_INITIAL);
    });

    it('Test 3.2.1 - should get an invalid user by id', async () => {
        const user = await User_DB.getUser(INVALID_USER_ID);

        user.should.be.false;
    });

    it('Test 3.3.0 - should add user to a chatroom', async () => {
        await User_DB.addRoom(user_with_email_id, CHATROOM_TEST_NAME);
        await User_DB.addRoom(user_without_email_id, CHATROOM_TEST_NAME);

        const user_with_email = await ChatRoom.findExistingUser(user_with_email_id, CHATROOM_TEST_NAME);
        const user_without_email = await ChatRoom.findExistingUser(user_without_email_id, CHATROOM_TEST_NAME);

        const user_with_email_test_id = user_with_email.users.map(user => user.user_id)
        .find(id => id === user_with_email_id);

        const user_without_email_test_id = user_without_email.users.map(user => user.user_id)
        .find(id => id === user_without_email_id);

        user_with_email_test_id.should.equal(user_with_email_id);
        user_without_email_test_id.should.equal(user_without_email_id);
    });

    it('Test 3.4.0 - should logoff a valid user ', async () => {
        const loggedOffValidUser = await User_DB.logOffUser(user_with_email_id);

        loggedOffValidUser.loggedIn.should.be.false;
        loggedOffValidUser.user.name.should.equal(USER_WITH_EMAIL.displayName);
    });

    it('Test 3.4.1 - should logoff an invalid user ', async () => {
        const loggedOffInvalidUser = await User_DB.logOffUser(INVALID_USER_ID);

        loggedOffInvalidUser.should.be.false;
    });

    it('Test 3.5.0 - should login a valid user ', async () => {
        const loggedInUser = await User_DB.logInUser(user_with_email_id);

        loggedInUser.loggedIn.should.be.true;
        loggedInUser.user.name.should.equal(USER_WITH_EMAIL.displayName);
    });

    it('Test 3.5.1 - should login an invalid user ', async () => {
        const loggedInInvalidUser = await User_DB.logInUser(INVALID_USER_ID);

        loggedInInvalidUser.should.be.false;
    });

    it('Test 3.6.0 - should find all the users that are online in a chatroom ', async () => {
        const onlineUsers = await User_DB.getOnlineUsersInRoom(CHATROOM_TEST_NAME);
        
        onlineUsers.should.include(USER_WITH_EMAIL.displayName);
        onlineUsers.should.include(USER_WITHOUT_EMAIL.displayName);
    });

    // it('Test 3.7.0 - should find all the rooms that a user is part of ', async () => {
    //     const roomsForUser = await User_DB.findRoomsForUser(user_with_email_id);


    // });

    it('Test 3.8.0 - should delete every user from the database ', async () => {
        await User_DB.deleteUser(user_with_email_id);
        await User_DB.deleteUser(user_without_email_id);
        
        const does_user_with_email_exist = await ChatRoom.findExistingUser(user_with_email_id, CHATROOM_TEST_NAME);
        const does_user_without_email_exist = await ChatRoom.findExistingUser(user_without_email_id, CHATROOM_TEST_NAME);
        
        should.not.exist(does_user_with_email_exist);
        should.not.exist(does_user_without_email_exist);

    });
});