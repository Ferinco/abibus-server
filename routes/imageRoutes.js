const express = require("express");
const router = express.Router();
const { getImages, addImage } = require("../controllers/imageController");
const auth = require("../middleware/auth");

router.get("/", auth, getImages);
router.post("/", auth, addImage);

module.exports = router;
