const express = require("express");
const router = express.Router();
const User = require("../models/User.js");

// GET /users - list users (safe fields only)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { fullname: 1, email: 1, role: 1, _id: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
