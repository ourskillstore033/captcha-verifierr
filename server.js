const API_URL = "https://captcha-verifierr.onrender.com";
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const captchas = {}; // store per user (simple version)

// Generate random ID
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// TEXT CAPTCHA
app.get("/captcha/text", (req, res) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let text = "";

  for (let i = 0; i < 5; i++) {
    text += chars[Math.floor(Math.random() * chars.length)];
  }

  const id = generateId();
  captchas[id] = { type: "text", answer: text };

  res.json({ id, text });
});

// MATH CAPTCHA
app.get("/captcha/math", (req, res) => {
  const a = Math.floor(Math.random() * 10);
  const b = Math.floor(Math.random() * 10);

  const id = generateId();
  captchas[id] = { type: "math", answer: a + b };

  res.json({ id, question: `${a} + ${b}` });
});

// VERIFY
app.post("/verify", (req, res) => {
  const { id, answer } = req.body;

  if (!captchas[id]) {
    return res.json({ success: false });
  }

  const valid =
    captchas[id].answer.toString().toUpperCase() ===
    answer.toString().toUpperCase();

  delete captchas[id]; // one-time use

  res.json({ success: valid });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
