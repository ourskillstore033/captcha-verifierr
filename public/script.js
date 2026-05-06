const API_URL = "https://captcha-verifierr.onrender.com";
const API_URL = ""; // keep empty for local, add backend URL after deploy

let currentId = "";
let currentType = "text";

async function loadCaptcha() {
  currentType = document.getElementById("captchaType").value;

  if (currentType === "text") {
    document.getElementById("mathBox").innerText = "";

    const res = await fetch(API_URL + "/captcha/text");
    const data = await res.json();

    currentId = data.id;
    drawCaptcha(data.text);
  }

  if (currentType === "math") {
    clearCanvas();

    const res = await fetch(API_URL + "/captcha/math");
    const data = await res.json();

    currentId = data.id;
    document.getElementById("mathBox").innerText = data.question;
  }
}

function drawCaptcha(text) {
  const canvas = document.getElementById("captchaCanvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = "32px Arial";
  ctx.fillStyle = "#333";

  // noise lines
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random()*220, Math.random()*70);
    ctx.lineTo(Math.random()*220, Math.random()*70);
    ctx.stroke();
  }

  ctx.fillText(text, 40, 45);
}

function clearCanvas() {
  const canvas = document.getElementById("captchaCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

async function verifyCaptcha() {
  const answer = document.getElementById("userInput").value;

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
    alert("Wrong captcha ❌");
    loadCaptcha();
  }
}

function showPopup() {
  const popup = document.getElementById("popup");
  popup.style.display = "block";

  setTimeout(() => {
    popup.style.display = "none";
  }, 3000);
}

// Load first captcha
loadCaptcha();