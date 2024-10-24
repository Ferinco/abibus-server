const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Create a new room
router.post('/', async (req, res, next) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
});

// Get all rooms
router.get('/', async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});

// Get a specific room
router.get('/:id', async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }
    res.json(room);
  } catch (error) {
    next(error);
  }
});

// Update a room
router.put('/:id', async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }
    res.json(room);
  } catch (error) {
    next(error);
  }
});

// Delete a room
router.delete('/:id', async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
