const express = require("express");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Auth guard for pages that require login
function requireAuth(req, res, next) {
  const email = req.cookies?.userEmail;
  if (!email) return res.redirect("/login.html");
  next();
}

// Protect recommend page: only accessible after login
app.get("/recommend.html", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "recommend.html"));
});

// --- Admin Panel Password Gate ---
const ADMIN_PASSWORD = "12345678";
// Generate a per-boot admin session version. Any existing cookie from a prior
// server run won’t match this value and will be treated as not authenticated.
const ADMIN_SESSION_VERSION = crypto.randomUUID();

app.get("/admin.html", (req, res) => {
  const authed = req.cookies?.adminAuthed === ADMIN_SESSION_VERSION;
  if (authed) {
    return res.sendFile(path.join(__dirname, "public", "admin.html"));
  }
  const error = req.query.error ? "<div style=\"color:#b00020;margin-bottom:10px;\">Incorrect password. Try again.</div>" : "";
  res.status(401).send(`<!doctype html>
  <html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Admin Login</title>
  <link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css\" rel=\"stylesheet\"></head>
  <body class=\"d-flex align-items-center justify-content-center\" style=\"min-height:100vh;background:#f5f7fb\">
    <div class=\"card p-4\" style=\"min-width:320px;max-width:360px\">
      <h5 class=\"mb-3\">Admin Access</h5>
      ${error}
      <form method=\"POST\" action=\"/admin/login\"> 
        <div class=\"mb-3\">
          <label class=\"form-label\">Password</label>
          <input type=\"password\" name=\"password\" class=\"form-control\" required autofocus>
        </div>
        <button class=\"btn btn-primary w-100\" type=\"submit\">Enter</button>
      </form>
      <a class=\"d-block text-center mt-3\" href=\"/\">Back to Home</a>
    </div>
  </body></html>`);
});

app.post("/admin/login", (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    res.cookie("adminAuthed", ADMIN_SESSION_VERSION, { httpOnly: true, sameSite: "lax" });
    return res.redirect("/admin.html");
  }
  return res.redirect("/admin.html?error=1");
});

app.post("/admin/logout", (req, res) => {
  res.clearCookie("adminAuthed");
  res.redirect("/");
});

app.use(express.static("public")); // Serve other frontend files

// Connect to MongoDB
connectDB();

// Mount routes
const authRoutes = require("./routes/auth");
const internshipRoutes = require("./routes/internships");
const usersRoutes = require("./routes/users");
app.use("/auth", authRoutes);
app.use("/internships", internshipRoutes);
app.use("/users", usersRoutes);

// Load internship data
const internshipsPath = path.join(__dirname, "data", "internships.json");
let internships = JSON.parse(fs.readFileSync(internshipsPath));

// Load users data
const usersPath = path.join(__dirname, "data", "users.json");
let users = JSON.parse(fs.readFileSync(usersPath));

// API: get internships
app.get("/api/internships", (req, res) => {
  res.json(internships);
});

// API: get users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// Fallback for frontend routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server live at http://localhost:${PORT}`);
  console.log(`Loaded ${users.length} users & ${internships.length} internships`);
});
