const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  availability: { type: Boolean, default: true },
  type: { type: String, required: true },
  images: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
