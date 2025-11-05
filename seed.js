const mongoose = require("mongoose");
const Internship = require("./models/Internship");
const raw = require("./data/internships.json");

(async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/miniProjectDB");
    console.log("✅ Connected to miniProjectDB for seeding");

    // Transform legacy data to match schema
    const cleaned = raw.map((it) => ({
      title: (it.title || "").trim(),
      company: (it.company || "").trim(),
      location: (it.location || "").trim(),
      education: it.education ? String(it.education).trim() : null,
      url: it.url ? String(it.url).trim() : null,
      duration: it.duration ? String(it.duration).trim() : null,
      skills: (() => {
        const s = it.skill || it.skills;
        if (!s) return [];
        if (Array.isArray(s)) return s.map((x) => String(x).trim()).filter(Boolean);
        return [String(s).replace(/\t/g, "").trim()].filter(Boolean);
      })(),
    }));

    await Internship.deleteMany({});
    await Internship.insertMany(cleaned);
    console.log(`✅ Inserted ${cleaned.length} internships into miniProjectDB.internships`);
  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("ℹ️  Mongo connection closed");
  }
})();
