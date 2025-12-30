const express = require("express");
const router = express.Router();
const {
  getImages,
  addImage,
  getSettings,
  updateSetting,
} = require("../controllers/mediaController");
const auth = require("../middleware/auth");

// Image routes
router.get("/images", auth, getImages);
router.post("/images", auth, addImage);

// Settings routes
router.get("/settings", auth, getSettings);
router.post("/settings", auth, updateSetting);

module.exports = router;
