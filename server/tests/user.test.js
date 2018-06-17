
const chai = require('chai');
const should = chai.should();  // Using Should style

const {User} = require('../models/user');
const {deepCopy} = require('./utils');
const {USER_ARRAY, NEW_USER, DUPLICATE_NEW_USER, INVALID_ID, INVALID_NAME} = require('./userConstants');

describe('Test Suite 1.0.0 - Add, and Delete Users connected to chatroom', () => {
  let userList;

  beforeEach(() => {
    userList = new User();

    userList.users = deepCopy(USER_ARRAY);
  });

  it('Test 1.1.0 - should find a user that\'s currently in the user list by id', () => {
    let foundUser = userList.getUser(USER_ARRAY[0].id);
    foundUser.should.deep.equal(USER_ARRAY[0]);
  });

  it('Test 1.1.1 - should not find a user that\'s not in the user list by id', () => {
    let foundUser = userList.getUser(INVALID_ID);
    should.not.exist(foundUser);
  });

  it('Test 1.2.0 - should find a user that exists in the user list by their name', () => {
    let foundUser = userList.getUserByName(USER_ARRAY[0].name);
    foundUser.should.deep.equal(USER_ARRAY[0]);
  });

  it('Test 1.2.1 - should not find a user that doesn\'t exist in the list by their name', () => {
    let foundUser = userList.getUserByName(INVALID_NAME);
    should.not.exist(foundUser);
  })

  it('Test 2.1.0 - should add a user to the user list', () => {
    userList.addUsers(NEW_USER.id, NEW_USER.room, NEW_USER.name);
    userList.users[3].should.be.an('Object').that.deep.equals(NEW_USER); //Compare objects with deep.eqauls
  });

  it('Test 2.1.1 - should not add a user with the same name and same room to the user list', () => {
    userList.addUsers(DUPLICATE_NEW_USER.id, DUPLICATE_NEW_USER.room, DUPLICATE_NEW_USER.name);
    userList.users.should.have.length(4);
  });

  it('Test 2.2.0 - should remove a user that exists from user list', () => {
    let removedUser = userList.removeUser(USER_ARRAY[0].id);
    removedUser.should.deep.equal(USER_ARRAY[0]);
    userList.users.should.have.length(2);
  });

  it('Test 2.2.1 - should not remove a user with an invalid user id', () => {
    let removedUser = userList.removeUser(INVALID_ID);
    userList.users.should.have.length(3);
    should.not.exist(removedUser);
  });

});

// describe('', () => {
//   let users;
//
//   beforeEach(() => {
//     users = new Users();
//     users.users = [{
//       id: '1',
//       name: 'Mike',
//       room: 'Node Course'
//     },{
//       id: '2',
//       name: 'Jen',
//       room: 'React Course'
//     },{
//       id: '3',
//       name: 'Julie',
//       room: 'Node Course'
//     }];
//   });
//
//   it('should add new user', () => {
//     let users = new Users();
//     let user = {
//       id: '123',
//       name: 'Temitayo',
//       room: 'The Office Fans'
//     };
//     let resUser = users.addUser(user.id, user.name, user.room);
//
//     expect(users.users).toEqual([user]);
//
//   });
//
//   it('should remove a user', () => {
//     let userId = '1';
//     let user = users.removeUser(userId);
//
//     expect(users.users.length).toBe(2);
//     expect(user.id).toBe(userId);
//   });
//
//   it('should not remove user', () => {
//     let userId = '1323432';
//     let user = users.removeUser(userId);
//
//     expect(users.users.length).toBe(3);
//     expect(user).toBeFalsy();
//   });
//
//   it('should find user', () => {
//     let userId = '2';
//     let user = users.getUser(userId);
//
//     expect(user.id).toEqual(userId);
//   });
//
//   it('should not find user', () => {
//     let userId = '1233';
//     let user = users.getUser(userId);
//
//     expect(user).toBeFalsy();
//   });
//
//   it('should return names for node course', () => {
//     let userList = users.getUserList('Node Course');
//
//     expect(userList).toEqual(['Mike', 'Julie']);
//   });
//
//   it('should return names for react course', () => {
//     let userList = users.getUserList('React Course');
//
//     expect(userList).toEqual(['Jen']);
//   });
//
// });
