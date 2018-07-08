const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const {User_DB} = require('../../db/models/User-db');

passport.use('local', new LocalStrategy(
  function(username, password, done) {

    User_DB.findOne({ "user.name": username}).then((user) => {
      if(user){
        console.log("User was found in database");


        bcrypt.compare(password, user.password, function(err, res) {
            // res == true
            if(err){
              throw err;
            }else if(!res){
              console.log("Invalid password");
              return done(null, false);
            }

            user.logInUser(function(err, loggedInUser){
              console.log(`After saving. Is user logged in? ${loggedInUser.loggedIn}`);
              console.log(JSON.stringify(loggedInUser,undefined,2));
              return done(null, loggedInUser);
            });

            console.log("Did NOT UPDATE USER");
        });


      }else{
        console.log("User was not found in the database");
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(password, salt, function(err, hash) {
            // Store hash in your password DB.
            if(err){
              throw err;
            }

            let newUser = new User_DB({
              "chatRoom": "",
              "loggedIn": true,
              "user.id": "",
              "user.token": "",
              "password": hash,
              "user.name": username,
              "user.email": "" //return the first email (incase there are numerous emails returned)
            });

            newUser.save().then((doc) => {
              console.log("User has been added to the database");
               return done(null, newUser);
            }).catch((e) => {
              console.log(`Unable to insert user into users database`);
              throw e;
            });

          });
        }); //end of bcrypt.genSalt


      }

    }).catch((err) => {
      return done(err);
    });

  }
));

module.exports = passport;
