const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  transaction: {
    type: Object,
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bookingStart: {
    type: Date,
    required: true,
  },
  bookingEnd: {
    type: Date,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
});

// Add a pre-save middleware to check for booking conflicts
paymentSchema.pre("save", async function (next) {
  if (this.isModified("status") && this.status === "completed") {
    const existingBookings = await this.constructor.find({
      roomId: this.roomId,
      status: "completed",
      $or: [
        {
          bookingStart: { $lte: this.bookingEnd },
          bookingEnd: { $gte: this.bookingStart },
        },
      ],
    });

    if (existingBookings.length > 0) {
      throw new Error("Room is already booked for these dates");
    }
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
