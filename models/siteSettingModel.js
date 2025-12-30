const mongoose = require("mongoose");

const siteSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, "Please provide a setting key"],
    unique: true,
    index: true,
  },
  value: {
    type: String,
    required: [true, "Please provide a setting value"],
  },
});

module.exports = mongoose.model("SiteSetting", siteSettingSchema);
