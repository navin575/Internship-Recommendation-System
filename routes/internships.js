const express = require("express");
const router = express.Router();
const Internship = require("../models/Internship.js");
const mongoose = require("mongoose");

router.post("/add", async (req, res) => {
  try {
    const internship = new Internship(req.body);
    await internship.save();
    res.json({ success: true, message: "Internship Added " });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const internships = await Internship.find();
    res.json(internships);
  } catch (error) {
    console.error("Error fetching internships:", error);
    res.json([]);
  }
});

// Delete an internship by id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[DELETE /internships/:id] requested id:", id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn("[DELETE /internships/:id] invalid ObjectId:", id);
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    const deleted = await Internship.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    console.log("[DELETE /internships/:id] deleted:", deleted?._id?.toString());
    res.json({ success: true, id: deleted._id?.toString() });
  } catch (error) {
    console.error("Error deleting internship:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;