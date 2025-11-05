const express = require("express");
const router = express.Router();
const User = require("../models/User.js");

// ✅ Signup
router.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).send("Email already exists!");

    await User.create({ fullname, email, password });
    res.redirect("/login.html");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password }); 

  if (!user) return res.status(401).send("Invalid email or password!");

  // Set a cookie to identify the current user (server will read it)
  res.cookie("userEmail", user.email, { httpOnly: true, sameSite: "lax" });
  // Redirect to the recommend page after successful login
  res.redirect("/recommend.html"); 
});

// Get current user based on cookie
router.get("/me", async (req, res) => {
  try {
    const email = req.cookies?.userEmail;
    if (!email) return res.status(401).json({ authenticated: false });
    const user = await User.findOne({ email }, { fullname: 1, email: 1, role: 1, _id: 0 });
    if (!user) return res.status(401).json({ authenticated: false });
    res.json({ authenticated: true, user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;