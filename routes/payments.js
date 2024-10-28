const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const auth = require("../middleware/auth");
const generatePDF = require("../utils/pdfGenerator");
const sendEmail = require("../utils/sendEmail");

// Create a new payment
router.post("/", async (req, res) => {
  try {
    const { roomId, email, amount } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required" });
    }
    const payment = new Payment({
      ...req.body,
    });
    await payment.save();

    // Generate invoice PDF
    const invoiceData = {
      invoiceNumber: payment._id,
      createdAt: payment.createdAt.toLocaleDateString(),
      email: payment.email,
      roomId: payment.roomId,
      amount: payment.amount,
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

module.exports = router;
