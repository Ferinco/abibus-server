const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const auth = require("../middleware/auth");
const generatePDF = require("../utils/pdfGenerator");
const sendEmail = require("../utils/sendEmail");
const Room = require("../models/Room");
const { fCurrency } = require("../utils/formatNumber");
const { fDateTime, fDate } = require("../utils/formatTime");

// Create a new payment
router.post("/", async (req, res) => {
  try {
    const { roomId, email, amount, bookingStart, bookingEnd } = req.body;

    // Validate required fields
    if (!email || !roomId || !bookingStart || !bookingEnd) {
      return res.status(400).json({
        message: "Email, Room ID, booking start date and end date are required",
      });
    }

    // Check if dates are valid
    const startDate = new Date(bookingStart);
    const endDate = new Date(bookingEnd);

    if (startDate >= endDate) {
      return res.status(400).json({
        message: "Booking end date must be after start date",
      });
    }

    // Check room availability
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isAvailable = await room.checkAvailability(startDate, endDate);
    if (!isAvailable) {
      return res.status(400).json({
        message: "Room is not available for the selected dates",
      });
    }

    const payment = new Payment({
      ...req.body,
      bookingStart: startDate,
      bookingEnd: endDate,
    });

    await payment.save();

    // Generate invoice PDF
    const invoiceData = {
      invoiceNumber: payment._id,
      createdAt: fDateTime(payment.createdAt),
      email: payment.email,
      roomId: payment.roomId,
      amount: payment.amount,
      customer_name: payment.firstName + " " + payment.lastName,
      customer_email: payment.email,
      transaction_id: payment.id,
      payment_date: fDateTime(payment.createdAt),
      total_amount: fCurrency(payment.amount),
      startDate: fDate(payment.bookingStart),
      endDate: fDate(payment.bookingEnd),
      amount_per_night: fCurrency(
        payment.amount /
          ((payment.bookingEnd - payment.bookingStart) / (1000 * 60 * 60 * 24))
      ),
      room_name: room.name,
    };
    const pdfBuffer = await generatePDF("invoice", invoiceData);

    // Send email with PDF attachment
    const emailOptions = {
      to: payment.email,
      subject: "Payment Invoice",
      text: "Thank you for your payment. Please find the invoice attached.",
      attachments: [
        {
          filename: `invoice_${payment._id}.pdf`,
          content: pdfBuffer,
        },
      ],
    };
    console.log(emailOptions);
    await sendEmail(emailOptions);

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all payments by user
router.get("/by-user/:email", async (req, res) => {
  try {
    const payments = await Payment.find({ email: req.params.email });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all payments with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      email,
      roomId,
      status,
    } = req.query;
    const query = {};

    // Apply filters if provided
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (email) {
      query.email = email;
    }
    if (roomId) {
      query.roomId = roomId;
    }
    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const payments = await Payment.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    // Get total number of documents
    const totalPayments = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(totalPayments / limit),
      currentPage: parseInt(page),
      totalPayments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment statistics
router.get("/stats", async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({
      status: "completed",
    });
    const pendingPayments = await Payment.countDocuments({ status: "pending" });
    const failedPayments = await Payment.countDocuments({ status: "failed" });

    const totalAmount = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalAmount: totalAmount[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific payment
router.get("/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a payment
router.patch("/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const allowedUpdates = ["status", "transaction"];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates" });
    }

    updates.forEach((update) => (payment[update] = req.body[update]));
    await payment.save();

    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a payment
router.delete("/:id", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new route to check room availability
router.get("/check-availability/:roomId", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Start date and end date are required",
      });
    }

    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isAvailable = await room.checkAvailability(
      new Date(startDate),
      new Date(endDate)
    );

    // Get all bookings for the room to show schedule
    const bookings = await Payment.find({
      roomId: req.params.roomId,
      status: "completed",
      bookingEnd: { $gte: new Date() },
    }).select("bookingStart bookingEnd");

    res.json({
      isAvailable,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new route to get room booking schedule
router.get("/room-schedule/:roomId", async (req, res) => {
  try {
    const { months = 3 } = req.query;
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Get start of today and end date
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(months));

    // Get all current and future bookings for the room
    const bookings = await Payment.find({
      roomId: req.params.roomId,
      status: "completed",
      bookingEnd: { $gte: startDate },
      bookingStart: { $lte: endDate },
    })
      .select("bookingStart bookingEnd email -_id")
      .sort({ bookingStart: 1 });

    const schedule = {
      roomId: req.params.roomId,
      currentBookings: bookings,
      nextAvailableDate: null,
      availabilityRanges: [],
    };

    // Calculate available date ranges
    let lastEndDate = new Date(Math.max(startDate, new Date()));

    for (const booking of bookings) {
      // Only create an availability range if there's a meaningful gap
      if (booking.bookingStart > lastEndDate) {
        schedule.availabilityRanges.push({
          start: new Date(lastEndDate),
          end: new Date(booking.bookingStart),
        });
      }
      lastEndDate = new Date(booking.bookingEnd);
    }

    // Add final range if there's space after last booking
    if (lastEndDate < endDate) {
      schedule.availabilityRanges.push({
        start: new Date(lastEndDate),
        end: new Date(endDate),
      });
    }

    // Filter out any ranges that are too short (optional, adjust minimum hours as needed)
    const minimumHours = 1;
    schedule.availabilityRanges = schedule.availabilityRanges.filter(
      (range) => {
        const hours = (range.end - range.start) / (1000 * 60 * 60);
        return hours >= minimumHours;
      }
    );

    // Set next available date
    if (schedule.availabilityRanges.length > 0) {
      schedule.nextAvailableDate = schedule.availabilityRanges[0].start;
    }

    // Add summary statistics
    schedule.summary = {
      totalBookings: bookings.length,
      availableRanges: schedule.availabilityRanges.length,
      isAvailableNow: schedule.availabilityRanges.some(
        (range) => range.start <= new Date() && range.end > new Date()
      ),
      nextAvailableDate: schedule.nextAvailableDate,
      currentStatus: {
        isOccupied: bookings.some(
          (booking) =>
            booking.bookingStart <= new Date() &&
            booking.bookingEnd >= new Date()
        ),
        currentBooking: bookings.find(
          (booking) =>
            booking.bookingStart <= new Date() &&
            booking.bookingEnd >= new Date()
        ),
      },
    };

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/room-bookings/:roomId", async (req, res) => {
  try {
    const bookings = await Payment.find({ roomId: req.params.roomId }).select(
      "bookingStart bookingEnd"
    );
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
