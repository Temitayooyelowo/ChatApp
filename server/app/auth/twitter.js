const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const {User_DB} = require('../../db/models/User-db');

passport.serializeUser(function (user, done) {
  done(null, user.user.id);
});

passport.deserializeUser(async function (id, done) {
  const user = await User_DB.getUser(id);
  
  return (!!user.error) ? done(user.error, null) : done (null, user);
});

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL,
    userAuthorizationURL: 'https://api.twitter.com/oauth/authenticate?force_login=true'
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(async function() {

      if(await User_DB.getUser(profile.id)){
        const loggedInUser = await User_DB.logInUser(profile.id);
        console.log("Did not update user");
        return (!loggedInUser || !!loggedInUser.error) ? done(loggedInUser, null) : done(null, loggedInUser);
      }

      const addedUser = await User_DB.addUserToDatabase(profile, accessToken);
      console.log("User has been added to the database");
      return (!!addedUser.error) ? done(addedUser.error, null) :done(null, addedUser);
      
    });

  }
));

module.exports = passport;
