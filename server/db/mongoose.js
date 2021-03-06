const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;
mongoose.connect(`${url}`).then(() => {
  console.log("Mongodb connection is successful");
}).catch((err) => {
  console.error(err);
});

module.exports = {
  mongoose: mongoose
};
