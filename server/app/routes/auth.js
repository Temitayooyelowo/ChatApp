const express = require('express');
const path = require('path');
const router = express.Router();

const passportFacebook = require('../auth/facebook');
const passportTwitter = require('../auth/twitter');
const passportGoogle = require('../auth/google');
const passportLocal = require('../auth/local');

/* LOCAL ROUTER */
router.post('/login',
  passportLocal.authenticate('local', {  failureRedirect: '/auth/login'}),
  function(req, res) {
    res.redirect('/users/chat');
  });

/* LOGIN ROUTER */
router.get('/login',function(req, res, next) {
  console.log("In login router");
  res.sendFile(path.join(__dirname, '../../../public', 'index.html'));
});

/* LOGOUT ROUTER */
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

/* FACEBOOK ROUTER */
router.get('/facebook',
  passportFacebook.authenticate('facebook', {authType: 'reauthenticate', scope : ['email'] }));

router.get('/facebook/callback',
  passportFacebook.authenticate('facebook', { failureRedirect: '/login'}),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/users/chat');
  });

/* TWITTER ROUTER */
router.get('/twitter',
  passportTwitter.authenticate('twitter', {authType: 'reauthenticate'}));

router.get('/twitter/callback',
  passportTwitter.authenticate('twitter', { failureRedirect: '/login'}),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/users/chat');
  });

/* GOOGLE ROUTER */
router.get('/google',
  passportGoogle.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback',
  passportGoogle.authenticate('google', { failureRedirect: '/login'}),
  function(req, res) {
    res.redirect('/users/chat');
  });

module.exports = router;
