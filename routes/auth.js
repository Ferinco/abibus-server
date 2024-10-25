const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Register a new user
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    console.log("Registration attempt for:", email);

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log("User already exists:", email);
      const error = new Error("User already exists");
      error.statusCode = 400;
      throw error;
    }

    // Create new user
    user = new User({ email, password, role });

    // Save user (password will be hashed by the pre-save hook)
    await user.save();
    console.log("User saved successfully:", user);

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user_id: user.id });
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
  }
});

// Login user
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for:", email);

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      const error = new Error("User not found");
      error.statusCode = 400;
      throw error;
    }

    console.log("User found:", user.email);

    // Check password using the method defined in the User model
    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      const error = new Error("Incorrect password");
      error.statusCode = 400;
      throw error;
    }

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
      (err, token) => {
        if (err) {
          console.error("JWT Sign Error:", err);
          throw err;
        }
        console.log("Login successful for user:", user.email);
        res.json({ token, user_id: user.id });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
});

module.exports = router;
