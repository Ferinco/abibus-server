const asyncHandler = require("express-async-handler");
const Image = require("../models/imageModel");
const SiteSetting = require("../models/siteSettingModel");

// @desc    Fetch all images
// @route   GET /api/v1/images
// @access  Protected
const getImages = asyncHandler(async (req, res) => {
  const images = await Image.find().sort({ createdAt: -1 });
  res.status(200).json({ images });
});

// @desc    Add a new image
// @route   POST /api/v1/images
// @access  Protected
const addImage = asyncHandler(async (req, res) => {
  const { url } = req.body;

  if (!url) {
    res.status(400);
    throw new Error("Please provide an image URL");
  }

  const image = await Image.create({
    url,
  });

  res.status(201).json(image);
});

// @desc    Fetch all settings
// @route   GET /api/v1/settings
// @access  Protected
const getSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSetting.find({});
  const settingsObject = {};

  settings.forEach((setting) => {
    settingsObject[setting.key] = setting.value;
  });

  res.status(200).json(settingsObject);
});

// @desc    Update or create a setting
// @route   POST /api/v1/settings
// @access  Protected
const updateSetting = asyncHandler(async (req, res) => {
  const { key, value } = req.body;

  if (!key || !value) {
    res.status(400);
    throw new Error("Please provide both key and value");
  }

  // Upsert operation
  const setting = await SiteSetting.findOneAndUpdate(
    { key },
    { value },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json(setting);
});

module.exports = {
  getImages,
  addImage,
  getSettings,
  updateSetting,
};
