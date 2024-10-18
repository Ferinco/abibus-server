const mongoose = require("mongoose");

function connectDb(uri) {
  console.log("Connecting to MongoDB...", uri);
  return mongoose.connect(uri, {serverSelectionTimeoutMS: 5000});
}

module.exports = connectDb;
