const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a service title"],
  },
  about: {
    type: String,
    required: [true, "Please provide a description (about)"],
  },
  image: {
    type: String,
    required: [true, "Please provide an image URL"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Service", serviceSchema);
