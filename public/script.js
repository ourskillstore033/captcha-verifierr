// 👉 CHANGE THIS to your Render backend URL
const API_URL = "https://captcha-verifierr.onrender.com";

let currentId = "";
let currentType = "text";

// Load captcha on page load
window.onload = () => {
  loadCaptcha();
};

// Load captcha based on type
async function loadCaptcha() {
  const typeSelect = document.getElementById("captchaType");
  currentType = typeSelect.value;

  const input = document.getElementById("userInput");
  input.value = "";

  if (currentType === "text") {
    document.getElementById("mathBox").innerText = "";

    try {
      const res = await fetch(API_URL + "/captcha/text");
      const data = await res.json();

      currentId = data.id;
      drawCaptcha(data.text);
    } catch (err) {
      alert("Server error. Try again.");
    }
  }

  if (currentType === "math") {
    clearCanvas();

    try {
      const res = await fetch(API_URL + "/captcha/math");
      const data = await res.json();

      currentId = data.id;
      document.getElementById("mathBox").innerText = data.question;
    } catch (err) {
      alert("Server error. Try again.");
    }
  }
}

// Draw text captcha on canvas
function drawCaptcha(text) {
  const canvas = document.getElementById("captchaCanvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Random noise lines
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 220, Math.random() * 70);
    ctx.lineTo(Math.random() * 220, Math.random() * 70);
    ctx.strokeStyle = "#ccc";
    ctx.stroke();
  }

  // Text
  ctx.font = "bold 32px Arial";
  ctx.fillStyle = "#333";
  ctx.fillText(text, 40, 45);
}

// Clear canvas
function clearCanvas() {
  const canvas = document.getElementById("captchaCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Verify captcha
async function verifyCaptcha() {
  const answer = document.getElementById("userInput").value.trim();

  if (!answer) {
    alert("Please enter captcha");
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
      showPopup();
    } else {
      showError();
      loadCaptcha();
    }
  } catch (err) {
    alert("Server not responding");
  }
}

// Success popup
function showPopup() {
  const popup = document.getElementById("popup");
  popup.innerText = "Captcha verified and usable ✅";
  popup.style.background = "#28a745";
  popup.style.display = "block";

  setTimeout(() => {
    popup.style.display = "none";
  }, 3000);
}

// Error popup
function showError() {
  const popup = document.getElementById("popup");
  popup.innerText = "Wrong captcha ❌";
  popup.style.background = "#dc3545";
  popup.style.display = "block";

  setTimeout(() => {
    popup.style.display = "none";
  }, 2000);
}
