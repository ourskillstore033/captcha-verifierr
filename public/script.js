// 👉 PUT your backend URL here (Render)
const API_URL = "https://captcha-verifierr.onrender.com";

let currentId = "";
let currentType = "text";

// Load first captcha
window.onload = () => {
  loadCaptcha();
};

// Load captcha
async function loadCaptcha() {
  const typeSelect = document.getElementById("captchaType");
  currentType = typeSelect.value;

  const input = document.getElementById("userInput");
  input.value = "";

  const canvas = document.getElementById("captchaCanvas");
  const mathBox = document.getElementById("mathBox");

  try {
    if (currentType === "text") {
      // Show canvas, hide math
      canvas.style.display = "block";
      mathBox.style.display = "none";

      const res = await fetch(API_URL + "/captcha/text");
      const data = await res.json();

      currentId = data.id;
      drawCaptcha(data.text);
    }

    if (currentType === "math") {
      // Show math, hide canvas
      canvas.style.display = "none";
      mathBox.style.display = "block";

      const res = await fetch(API_URL + "/captcha/math");
      const data = await res.json();

      currentId = data.id;
      mathBox.innerText = data.question;
    }
  } catch (err) {
    showError("Server error. Try again.");
  }
}

// 🔥 Distorted captcha drawing
function drawCaptcha(text) {
  const canvas = document.getElementById("captchaCanvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = "#f2f2f2";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Noise lines
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 220, Math.random() * 70);
    ctx.lineTo(Math.random() * 220, Math.random() * 70);
    ctx.strokeStyle = "#aaa";
    ctx.stroke();
  }

  // Distorted text
  for (let i = 0; i < text.length; i++) {
    const x = 20 + i * 35;
    const y = 40 + Math.random() * 10;
    const angle = (Math.random() - 0.5) * 0.5;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#333";
    ctx.fillText(text[i], 0, 0);

    ctx.restore();
  }

  // Noise dots
  for (let i = 0; i < 30; i++) {
    ctx.fillRect(
      Math.random() * 220,
      Math.random() * 70,
      2,
      2
    );
  }
}

// Verify captcha
async function verifyCaptcha() {
  const answer = document.getElementById("userInput").value.trim();

  if (!answer) {
    showError("Please enter captcha");
    return;
  }

  try {
    const res = await fetch(API_URL + "/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: currentId,
        answer: answer
      })
    });

    const data = await res.json();

    if (data.success) {
      showSuccess();
    } else {
      showError("Wrong captcha ❌");
      loadCaptcha();
    }
  } catch (err) {
    showError("Server not responding");
  }
}

// Success popup
function showSuccess() {
  const popup = document.getElementById("popup");
  popup.innerText = "Captcha verified and usable ✅";
  popup.style.background = "#28a745";
  popup.style.display = "block";

  setTimeout(() => {
    popup.style.display = "none";
  }, 3000);
}

// Error popup
function showError(msg) {
  const popup = document.getElementById("popup");
  popup.innerText = msg;
  popup.style.background = "#dc3545";
  popup.style.display = "block";

  setTimeout(() => {
    popup.style.display = "none";
  }, 2000);
}
