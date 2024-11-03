const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    availability: { type: Boolean, default: true },
    type: { type: String, required: true },
    images: [{ type: String }],
    booked_till: { type: Date },
    booked_on: Date,
  },
  { timestamps: true }
);

roomSchema.methods.checkAvailability = async function (startDate, endDate) {
  const bookings = await mongoose.model("Payment").find({
    roomId: this._id,
    status: "completed",
    $or: [
      {
        bookingStart: { $lte: endDate },
        bookingEnd: { $gte: startDate },
      },
    ],
  });

  return bookings.length === 0;
};

// Add a static method to get available rooms for a date range
roomSchema.statics.getAvailableRooms = async function (startDate, endDate) {
  const rooms = await this.find();
  const availableRooms = [];

  for (const room of rooms) {
    const isAvailable = await room.checkAvailability(startDate, endDate);
    if (isAvailable) {
      availableRooms.push(room);
    }
  }

  return availableRooms;
};

module.exports = mongoose.model("Room", roomSchema);
