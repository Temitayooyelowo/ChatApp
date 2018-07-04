require('./config/config');  //configure environmental variabless

const express = require('express');
const path = require('path');
const http = require('http'); //built in node module
const socketIO = require('socket.io');
const moment = require('moment');

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');

const {mongoose} = require('./db/mongoose');
const {User_DB} = require('./db/models/User-db');
const {User} = require('./db/models/User');

const dbName = 'ChatApp';
const port = process.env.PORT || 3000;

// const userList = new User();

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    enableProof: true,
    profileFields: ['id', 'displayName', 'email']
  },
  function(accessToken, refreshToken, profile, callback) {
    process.nextTick(function() {

        User_DB.findOne({ "facebook.id": profile.id }).then((user) => {
          if(user){
            console.log("User was found in database");

            User_DB.logInUser(profile.id, function(err, loggedInUser){
              console.log(`After saving. Is user logged in? ${loggedInUser.loggedIn}`);
              console.log(JSON.stringify(loggedInUser,undefined,2));
              return callback(null, loggedInUser);
            });

            console.log("Did NOT UPDATE USER");
          }else{
            console.log("User was not found in the database");

            let newUser = new User_DB({
              "chatRoom": "",
              "loggedIn": true,
              "facebook.id": profile.id,
              "facebook.token": accessToken,
              "facebook.name": profile.displayName,
              "facebook.email": profile.emails[0].value //return the first email (incase there are numerous emails returned)
            });

            newUser.save().then((doc) => {
              console.log("User has been added to the database");
               return callback(null, newUser);
            }).catch((e) => {
              console.log('Unable to insert user into ' + dbName + '. ' + e);
              throw e;
            });
          }

        }).catch((err) => {
          return callback(err);
        });

    });
}));

// Configure Passport authenticated session persistence.
passport.serializeUser(function(user, callback) {
  callback(null, user.id);
});

// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.
passport.deserializeUser(function(id, callback) {
      User_DB.findById(id, function(err, user) {
          callback(err, user);
      });
});

const app = express();
const server = http.createServer(app); // http server instead of express server
const io = socketIO(server);

// Initialize Passport and restore authentication state, if any, from the
// session.
// app.use(express.static(path.join(__dirname, '../public')));
app.use(require('serve-static')(__dirname + '/../public'));
app.use(require('morgan')('combined'));
app.use(cookieParser());
app.use(require('body-parser').urlencoded({ extended: true }));

const session = require("express-session")({
  secret: process.env.FACEBOOK_APP_SECRET,
  resave: true,
  saveUninitialized: true
});
const sharedsession = require("express-socket.io-session");

app.use(session);
// app.use(session({
//   secret: process.env.FACEBOOK_APP_SECRET,
//   resave: true,
//   saveUninitialized: true
//   // cookie: {
//   //   secure: process.env.ENVIRONMENT && process.env.ENVIRONMENT !== 'development' && process.env.ENVIRONMENT !== 'test',
//   //   maxAge: 24*60*60
//   // }
// }));

app.use(passport.initialize());
app.use(passport.session());

// route for facebook authentication, login and logout
app.get('/auth/facebook', passport.authenticate('facebook', {authType: 'reauthenticate', scope : ['email'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {failureRedirect: '/login' }),
function(req, res) {
  // console.log(res.IncomingMessage);
  res.redirect('/chat');
});

// route for logging out
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');

    User_DB.deleteUser(id, function(err, removedUser) {

      if(err){
        throw err;
      }else if(!removedUser){
          console.log(`${user} not found`);
          return;
      }

      console.log(`{removeUser.facebook.name} has been removed from the database room`)
    });

});

//Route for chat room
app.get('/chat',
  require('connect-ensure-login').ensureLoggedIn(),
function(req, res) {
  res.sendFile(path.join(__dirname, '../public', 'chat.html'));
});

io.use(sharedsession(session));

io.on('connection', (socket) => {

  socket.on('join', (room, callback) => {

      const id = socket.handshake.session.passport.user;
      console.log(`Id is ${id}`);
      let userName;
      let oldChatRoom = "";
      let formattedTime = moment().format('LT');

      User_DB.findById(id).then((user) => {
        userName = user.facebook.name;
        oldChatRoom = user.chatRoom;

        console.log("User is", JSON.stringify(user,undefined,2));

        if(!user){
          console.log("User does not exist");
          callback();
        }

        if(oldChatRoom){

          if(oldChatRoom === room){
            console.log("Oldchatroom and new chat room are the same. Do nothing.");
            callback();
          }

          console.log("Old chat room exists");
          let tempMessage = `${user.facebook.name} has left the ${user.chatRoom} chatroom.`;
          socket.broadcast.to(oldChatRoom).emit('broadcastMessage', {
            user: 'Admin',
            text: tempMessage,
            createdAt: formattedTime
          });

          User_DB.getRoomUsers(room, function(err, userList){
            io.to(room).emit('updateList', {
               reason: 'updateUserList',
               list: userList
             });
          });

          User_DB.getRoomList(function(err, roomList){
            io.emit('updateList', {
               reason: 'updateRoomList',
               list: roomList
             });
          });

          let message = `${userName} has left the ${oldChatRoom} chatroom.`;

          user.chatRoom = room;
        }
        console.log('User did not belong to a previous chat room');

        User_DB.addRoom(id, room, function(error){
          if(error){
            throw error;
          }

          socket.join(room);

          User_DB.getRoomUsers(room, function(err, userList){
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
          });

          User_DB.getRoomList(function(err, roomList){
            console.log("In server.js line 211 foom list ", roomList);
            my_Rooms = roomList;
            console.log(`Room List: ${my_Rooms}`);
            io.emit('updateList', {
               reason: 'updateRoomList',
               list: roomList
             });
          });

        });

      }).catch((e) => {
        console.log("An error occured while trying to find the user in the database");
        throw e;
      });

      //Find records without the same facebook id and the same room
      User_DB.findOne({'_id': {$ne: id}, 'chatRoom': room}).then((user) =>{
        if(user){
          return callback(`${userName} already exists in ${room} chatroom.`)
        }
      }).catch((e) => {
        console.log('Error when trying to find out if the user already exists in a room');
        throw e;
      });

      callback();
  });

  socket.on('createMessage', (message, callback)  => {
    const id = socket.handshake.session.passport.user;
    let user = User_DB.getUser(id, function(err, user) {
      console.log(`Message has been received by server and is being broadcasted: ${message.text} from room ${user.chatRoom}`);
      if(err){
        callback(err);
      }

      io.to(user.chatRoom).emit('broadcastMessage', {
        text: message.text,
        user: user.facebook.name
      });

      callback();
    });
  });

  socket.on('disconnect', (callback) => {

    const id = socket.handshake.session.passport.user;

    User_DB.logOffUser(id, function(err, loggedOffedUser){
      if(err){
        console.log("An error was encountered when logging off the user. Please check logs for details.");
        throw err;
      }

      let message = `${loggedOffedUser.facebook.name} has left the ${loggedOffedUser.chatRoom} chatroom.`;
      console.log("Removed User:", JSON.stringify(loggedOffedUser, undefined, 2));

      socket.broadcast.to(loggedOffedUser.room).emit('broadcastMessage', {
        user: 'Admin',
        text: message,
        createdAt: moment.valueOf()
      });

      User_DB.getRoomUsers(loggedOffedUser.chatRoom, function(err, userList){
        if(err){
          throw err;
        }

        io.to(loggedOffedUser.chatRoom).emit('updateList', {
           reason: 'updateUserList',
           list: userList
         });
       });

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

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/failure', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'duplicate.html'));
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
