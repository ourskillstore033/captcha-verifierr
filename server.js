const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (only used if hosting frontend on same server)
app.use(express.static("public"));

// In-memory captcha store
const captchas = {};

// Generate unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Cleanup old captchas (optional basic security)
setInterval(() => {
  const now = Date.now();
  for (let id in captchas) {
    if (now - captchas[id].createdAt > 2 * 60 * 1000) {
      delete captchas[id]; // expire after 2 minutes
    }
  }
}, 60000);

// =======================
// TEXT CAPTCHA
// =======================
app.get("/captcha/text", (req, res) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let text = "";

  for (let i = 0; i < 5; i++) {
    text += chars[Math.floor(Math.random() * chars.length)];
  }

  const id = generateId();

  captchas[id] = {
    type: "text",
    answer: text,
    createdAt: Date.now()
  };

  res.json({ id, text });
});

app.get("/captcha/image", (req, res) => {
  const images = [
    { url: "https://via.placeholder.com/100?text=Cat", correct: true },
    { url: "https://via.placeholder.com/100?text=Dog", correct: false },
    { url: "https://via.placeholder.com/100?text=Cat", correct: true },
    { url: "https://via.placeholder.com/100?text=Car", correct: false },
    { url: "https://via.placeholder.com/100?text=Cat", correct: true },
    { url: "https://via.placeholder.com/100?text=Tree", correct: false }
  ];

  const id = generateId();

  captchas[id] = {
    type: "image",
    answer: images.map((img, i) => img.correct ? i : null).filter(v => v !== null),
    createdAt: Date.now()
  };

  res.json({
    id,
    question: "Select all CAT images",
    images
  });
});
// =======================
// MATH CAPTCHA
// =======================
app.get("/captcha/math", (req, res) => {
  const a = Math.floor(Math.random() * 10);
  const b = Math.floor(Math.random() * 10);

  const id = generateId();

  captchas[id] = {
    type: "math",
    answer: (a + b).toString(),
    createdAt: Date.now()
  };

  res.json({
    id,
    question: `${a} + ${b}`
  });
});

// =======================
// VERIFY CAPTCHA
// =======================
app.post("/verify", (req, res) => {
  const { id, answer } = req.body;

  if (!id || !answer) {
    return res.json({ success: false, message: "Missing data" });
  }

  const captcha = captchas[id];

  if (!captcha) {
    return res.json({ success: false, message: "Captcha expired or invalid" });
  }

  const isValid =
    captcha.answer.toUpperCase() === answer.toString().toUpperCase();

  // Delete after one use
  delete captchas[id];

  if (isValid) {
    return res.json({ success: true });
  } else {
    return res.json({ success: false });
  }
});

// =======================
// ROOT ROUTE (Fix "Cannot GET /")
// =======================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
