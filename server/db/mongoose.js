const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;
mongoose.connect(`${url}`);

module.exports = {
  mongoose: mongoose
};
