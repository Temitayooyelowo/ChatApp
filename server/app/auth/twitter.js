const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const {User_DB} = require('../../db/models/User-db');

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {

  User_DB.findById(id, function(err, user) {
      done(err, user);
  });

});

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL,
    userAuthorizationURL: 'https://api.twitter.com/oauth/authenticate?force_login=true'
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

  }
));

module.exports = passport;
