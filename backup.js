require('./config/config');  //configure environmental variables

const express = require('express');
const path = require('path');
const http = require('http'); //built in node module
const socketIO = require('socket.io');
const moment = require('moment');

const passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');

const {mongoose} = require('./db/mongoose');
const {User_DB} = require('./db/models/User-db');
const {User} = require('./db/models/User');

const dbName = 'ChatApp';
const port = process.env.PORT || 3000;

const userList = new User();

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    enableProof: true,
    profileFields: ['id', 'displayName', 'email']
  },
  function(accessToken, refreshToken, profile, callback) {
    process.nextTick(function() {

        User_DB.findOne({ facebookId: profile.id }).then((user) => {
          if(user){
            return callback(null, user);
          }

          let newUser = new User_DB({
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
//const session = require('express-session');
// const RedisStore = require('connect-redis')(session);
// const myRedisStore = new RedisStore();

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

    User_DB.findOneAndRemove({ facebookId: req.user.facebook.id}).then((user) => {

      if(!user){
          console.log(`${user} not found`);
          return;
      }
      console.log(`${user.name} has been removed. from ${dbName} database.`);
    }).catch((e) => {
      console.log("Document not removed.", e);
    });

});

//Route for chat room
var global_FB_ID = '';
var global_FB_NAME = '';
// app.get('/chat',
//   require('connect-ensure-login').ensureLoggedIn(),
// function(req, res) {
//   // // console.log(req.user.facebook.name);
//   // global_FB_NAME = req.user.facebook.name;
//   // global_FB_ID = req.user.facebook.id;
//   res.sendFile(path.join(__dirname, '../public', 'chat.html'));
// });

// io.use(passportSocketIo.authorize({
//   key: 'connect.sid',
//   secret: process.env.FACEBOOK_APP_SECRET,
//   store: myRedisStore,
//   passport: passport,
//   cookieParser: cookieParser
// }));

app.get('/chat', function(req, res) {
  res.sendFile(path.join(__dirname, '../public', 'chat.html'));
});

io.use(sharedsession(session));

io.on('connection', (socket) => {

  socket.on('join', (room, callback) => {

      socket.join(room);

      let userName = global_FB_NAME;
      let removedUser = userList.removeUser(socket.id);
      let formattedTime = moment().format('LT');

      if(removedUser) {
        let message = `${removedUser.name} has left the ${removedUser.room} chatroom.`;
        socket.broadcast.to(removedUser.room).emit('broadcastMessage', {
          user: 'Admin',
          text: message,
          createdAt: formattedTime
        });

        io.to(removedUser.room).emit('updateList', {
           reason: 'updateUserList',
           list: userList.getRoomUsers(removedUser.room)
         });

         io.emit('updateList', {
            reason: 'updateRoomList',
            list: userList.getRoomList()
          });
      }

      let isUserAdded = userList.addUsers(socket.id, room, userName, global_FB_ID);

      if(!isUserAdded){
        return callback(`${userName} already exists in ${room} chatroom.`)
      }

      io.to(room).emit('updateList', {
         reason: 'updateUserList',
         list: userList.getRoomUsers(room)
       });

       io.emit('updateList', {
          reason: 'updateRoomList',
          list: userList.getRoomList()
        });

      //sends to only the owner of the socket
      socket.emit('userConnected', {
        user: 'Admin',
        text: `Welcome to the chat app ${userName}.`,
        createdAt: formattedTime
      });

      console.log(`Welcome to the chat app ${userName}.`);
      console.log(`Room List: ${userList.getRoomList()}`);

      //Send to everyone EXCEPT the owner of the socket
      socket.broadcast.to(room).emit('userConnected', {
        user: 'Admin',
        text: `${userName} has joined ${room} chatroom.`,
        createdAt: formattedTime
      });

      callback();
  });

  socket.on('createMessage', (message, callback)  => {

    let user = userList.getUser(socket.id);

    console.log(`Message has been received by server and is being broadcasted: ${message.text} from room ${user.room}`);

    io.to(user.room).emit('broadcastMessage', {
      text: message.text,
      user: user.name
    });

    callback();
  });

  socket.on('disconnect', (callback) => {
    let removedUser = userList.removeUser(socket.id);
    let message = `${removedUser.name} has left the ${removedUser.room} chatroom.`;
    //console.log("Removed User:", JSON.stringify(removedUser, undefined, 2));

    socket.broadcast.to(removedUser.room).emit('broadcastMessage', {
      user: 'Admin',
      text: message,
      createdAt: moment.valueOf()
    });

    io.to(removedUser.room).emit('updateList', {
       reason: 'updateUserList',
       list: userList.getRoomUsers(removedUser.room)
     });

     io.emit('updateList', {
        reason: 'updateRoomList',
        list: userList.getRoomList()
      });

    console.log(message);

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
