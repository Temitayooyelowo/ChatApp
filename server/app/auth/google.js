const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const {User_DB} = require('../../db/models/User-db');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET_KEY,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
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
              "user.email": "" //return the first email (incase there are numerous emails returned)
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
    // "user.id": profile.id, "user.email": "", "chatRoom": "",
    // "loggedIn": true, "user.token": accessToken}).then((result) => {
    //
    //       console.log("In google then block");
    //       //change logged in field to true if the user isn't a new user
    //       if(!result.isNew){
    //         user.logInUser(function(err, loggedInUser){
    //           console.log(`After saving. Is user logged in? ${loggedInUser.loggedIn}`);
    //           console.log(JSON.stringify(loggedInUser,undefined,2));
    //           return done(null, loggedInUser);
    //         });
    //       }
    //
    //       done(null, user);
    // }).catch((error) => {
    //       console.log("In google catch block");
    //       return done(err);
    // });

  }
));

module.exports = passport;
