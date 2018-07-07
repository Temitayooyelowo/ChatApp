const express = require('express');
const router = express.Router();

const path = require('path');

/* GET users listing. */
router.get('/chat', ensureAuthenticated, function(req, res, next) {
  res.sendFile(path.join(__dirname, '../../../public', 'chat.html'));
});

function ensureAuthenticated(req, res, next) {
  console.log("In ensure authenticated")
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/login')
}

module.exports = router;
