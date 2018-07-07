const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const {User_DB} = require('../../db/models/User-db');


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    enableProof: true,
    profileFields: ['id', 'displayName', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {

        User_DB.findOne({ "user.id": profile.id }).then((user) => {
          if(user){
            console.log("User was found in database");

            user.logInUser(function(err, loggedInUser){
              console.log(`After saving. Is user logged in? ${loggedInUser.loggedIn}`);
              console.log(JSON.stringify(loggedInUser,undefined,2));
              return done(null, loggedInUser);
            });

            console.log("Did NOT UPDATE USER");
          }else{
            console.log("User was not found in the database");

            let newUser = new User_DB({
              "chatRoom": "",
              "loggedIn": true,
              "user.id": profile.id,
              "user.token": accessToken,
              "user.name": profile.displayName,
              "user.email": profile.emails[0].value //return the first email (incase there are numerous emails returned)
            });

            newUser.save().then((doc) => {
              console.log("User has been added to the database");
               return done(null, newUser);
            }).catch((e) => {
              console.log(`Unable to insert user into users database`);
              throw e;
            });
          }

        }).catch((err) => {
          return done(err);
        });

    });


      // User_DB.findOrCreate({"user.name": profile.displayName, "user.id": profile.id}, {"user.name": profile.displayName,
      // "user.id": profile.id, "user.email": profile.emails[0].value, "chatRoom": "8",
      // "loggedIn": true, "user.token": accessToken}, function (err, user) {
      //
      //       if (err) {
      //         console.log("In the if statement");
      //         return done(err, null);
      //       }
      //
      //       console.log("After if statement");
      //       done(null, user);

            //change logged in field to true if the user isn't a new user
            // if(!result.isNew){
            //   console.log("I'm in the if statement");
              // console.log(JSON.stringfy(result, undefined, 2));
              // user.logInUser(function(err, loggedInUser){
              //   console.log(`After saving. Is user logged in? ${loggedInUser.loggedIn}`);
              //   console.log(JSON.stringify(loggedInUser,undefined,2));
              //   return done(null, loggedInUser);
              // });
            // }

            //done(null, user);
      // });


  }));

module.exports = passport;
