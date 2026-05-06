const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 🔴 install: npm install node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const captchas = {};
function genId() {
  return Math.random().toString(36).substring(2, 10);
}

// ================= TEXT CAPTCHA =================
app.get("/captcha/text", (req, res) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let text = "";
  for (let i = 0; i < 5; i++) {
    text += chars[Math.floor(Math.random() * chars.length)];
  }

  const id = genId();
  captchas[id] = { answer: text.toUpperCase() };

  res.json({ id, text });
});

// ================= MATH CAPTCHA =================
app.get("/captcha/math", (req, res) => {
  const a = Math.floor(Math.random() * 10);
  const b = Math.floor(Math.random() * 10);

  const id = genId();
  captchas[id] = { answer: (a + b).toString() };

  res.json({ id, question: `${a} + ${b}` });
});

// ================= IMAGE CAPTCHA =================
app.get("/captcha/image", (req, res) => {
  const images = [
    { url: "https://via.placeholder.com/100?text=Cat", correct: true },
    { url: "https://via.placeholder.com/100?text=Dog", correct: false },
    { url: "https://via.placeholder.com/100?text=Cat", correct: true },
    { url: "https://via.placeholder.com/100?text=Car", correct: false },
    { url: "https://via.placeholder.com/100?text=Cat", correct: true },
    { url: "https://via.placeholder.com/100?text=Tree", correct: false }
  ];

  const id = genId();
  captchas[id] = {
    answer: images.map((img, i) => img.correct ? i : null).filter(v => v !== null)
  };

  res.json({ id, question: "Select all CAT images", images });
});

// ================= VERIFY (WITH TURNSTILE) =================
app.post("/verify-all", async (req, res) => {
  const { id, answer, token } = req.body;

  // 1️⃣ Verify Turnstile
  const cfRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: "0x4AAAAAADKQ2yviWotw7IJmiDyLdp7B_6E", // 🔴 replace here
      response: token
    })
  });

  const cfData = await cfRes.json();

  if (!cfData.success) {
    return res.json({ success: false, message: "Turnstile failed" });
  }

  // 2️⃣ Verify your captcha
  const captcha = captchas[id];
  if (!captcha) return res.json({ success: false });

  let valid = false;

  if (Array.isArray(captcha.answer)) {
    valid = JSON.stringify(captcha.answer.sort()) === JSON.stringify(answer.sort());
  } else {
    valid = captcha.answer === answer.toString().toUpperCase();
  }

  delete captchas[id];
  res.json({ success: valid });
});

// ROOT FIX
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(process.env.PORT || 3000, () => console.log("Server running"));
