const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const {User_DB} = require('../../db/models/User-db');
const {ChatRoom} = require('../../db/models/chatRoom');

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    enableProof: true,
    profileFields: ['id', 'displayName', 'email']
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

  }));

module.exports = passport;
