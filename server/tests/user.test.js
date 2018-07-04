
const chai = require('chai');
const should = chai.should();  // Using Should style

const {User} = require('../db/models/user');
const {deepCopy} = require('./utils');
const userConstant = require('./userConstants');

describe('Test Suite 1.0.0 - Add, and Delete Users connected to chatroom', () => {
  let userList;

  beforeEach(() => {
    userList = new User();

    userList.users = deepCopy(userConstant.USER_ARRAY);
  });

  it('Test 1.1.0 - should find a user that\'s currently in the user list by id', () => {
    let foundUser = userList.getUser(userConstant.USER_ARRAY[0].id);
    foundUser.should.deep.equal(userConstant.USER_ARRAY[0]);
  });

  it('Test 1.1.1 - should not find a user that\'s not in the user list by id', () => {
    let foundUser = userList.getUser(userConstant.INVALID_ID);
    should.not.exist(foundUser);
  });

  it('Test 1.2.0 - should find a user that exists in the user list by their name', () => {
    let foundUser = userList.getUserByName(userConstant.USER_ARRAY[0].name);
    foundUser.should.deep.equal(userConstant.USER_ARRAY[0]);
  });

  it('Test 1.2.1 - should not find a user that doesn\'t exist in the list by their name', () => {
    let foundUser = userList.getUserByName(userConstant.INVALID_NAME);
    should.not.exist(foundUser);
  })

  it('Test 2.1.0 - should add a user to the user list', () => {
    userList.addUsers(userConstant.NEW_USER.id, userConstant.NEW_USER.room, userConstant.NEW_USER.name);
    userList.users[3].should.be.an('Object').that.deep.equals(userConstant.NEW_USER); //Compare objects with deep.eqauls
  });

  it('Test 2.1.1 - should not add a user with the same name and same room to the user list', () => {
    userList.addUsers(userConstant.DUPLICATE_NEW_USER.id, userConstant.DUPLICATE_NEW_USER.room, userConstant.DUPLICATE_NEW_USER.name);
    userList.users.should.have.length(4);
  });

  it('Test 2.2.0 - should remove a user that exists from user list', () => {
    let removedUser = userList.removeUser(userConstant.USER_ARRAY[0].id);
    removedUser.should.deep.equal(userConstant.USER_ARRAY[0]);
    userList.users.should.have.length(2);
  });

  it('Test 2.2.1 - should not remove a user with an invalid user id', () => {
    let removedUser = userList.removeUser(userConstant.INVALID_ID);
    userList.users.should.have.length(3);
    should.not.exist(removedUser);
  });

  it('Test 2.3.0 - should get the list of rooms that are available without duplicates', () => {
    let roomList = userList.getRoomList();
    roomList.should.deep.equal(userConstant.ROOM_LIST);
  });

});
