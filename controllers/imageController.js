const Image = require("../models/imageModel");

// @desc    Fetch all images
// @route   GET /api/v1/images
// @access  Protected
const getImages = async (req, res, next) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.status(200).json({ images });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new image
// @route   POST /api/v1/images
// @access  Protected
const addImage = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      const error = new Error("Please provide an image URL");
      error.statusCode = 400;
      throw error;
    }

    const image = await Image.create({
      url,
    });

    res.status(201).json(image);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getImages,
  addImage,
};
