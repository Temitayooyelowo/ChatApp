require('./../config/config');  //configure environmental variablessss

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const http = require('http'); //built in node module
const path = require('path');
const socketIO = require('socket.io');
const sharedsession = require("express-socket.io-session");

const users = require('./routes/users');
const auth = require('./routes/auth');

const port = process.env.PORT || 3000;
const app = express();

const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, '../../public')));
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));

const expressSession = session({
  secret: process.env.JWT_SECRET,
  resave: true,
  saveUninitialized: true
});

app.use(expressSession);

const webSockets = require('./sockets/socket')(io, sharedsession(expressSession));

app.use(passport.initialize());
app.use(passport.session());

app.use('/users', users);
app.use('/auth', auth);

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
