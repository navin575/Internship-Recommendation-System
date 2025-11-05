const mongoose = require("mongoose");

const InternshipSchema = new mongoose.Schema({
  title: String,
  company: String,
  duration: { type: String, default: null },
  skills: [String],
  location: String,
  education: { type: String, default: null },
  url: { type: String, default: null }
});

module.exports = mongoose.model("Internship", InternshipSchema);
