// 👉 PUT your backend URL (Render)
const API_URL = "https://captcha-verifierr.onrender.com";

let currentId = "";
let currentType = "text";

// Load first captcha
window.onload = () => {
  loadCaptcha();
};

// ==========================
// LOAD CAPTCHA
// ==========================
async function loadCaptcha() {
  const typeSelect = document.getElementById("captchaType");
  currentType = typeSelect.value;

  const canvas = document.getElementById("captchaCanvas");
  const mathBox = document.getElementById("mathBox");
  const imageBox = document.getElementById("imageBox");
  const sliderBox = document.getElementById("sliderBox");
  const puzzleBox = document.getElementById("puzzleBox");

  document.getElementById("userInput").value = "";

  // Hide all
  canvas.style.display = "none";
  mathBox.style.display = "none";
  imageBox.style.display = "none";
  sliderBox.style.display = "none";
  puzzleBox.style.display = "none";

  try {
    // TEXT
    if (currentType === "text") {
      canvas.style.display = "block";

      const res = await fetch(API_URL + "/captcha/text");
      const data = await res.json();

      currentId = data.id;
      drawCaptcha(data.text);
    }

    // MATH
    if (currentType === "math") {
      mathBox.style.display = "block";

      const res = await fetch(API_URL + "/captcha/math");
      const data = await res.json();

      currentId = data.id;
      mathBox.innerText = data.question;
    }

    // IMAGE
    if (currentType === "image") {
      imageBox.style.display = "block";

      const res = await fetch(API_URL + "/captcha/image");
      const data = await res.json();

      currentId = data.id;
      document.getElementById("imageQuestion").innerText = data.question;

      const grid = document.getElementById("imageGrid");
      grid.innerHTML = "";

      data.images.forEach((img, index) => {
        const el = document.createElement("img");
        el.src = img.url;

        el.onclick = () => {
          el.classList.toggle("selected");
        };

        grid.appendChild(el);
      });
    }

    // SLIDER
    if (currentType === "slider") {
      sliderBox.style.display = "block";
      initSlider();
    }

    // PUZZLE
    if (currentType === "puzzle") {
      puzzleBox.style.display = "block";
      initPuzzle();
    }

  } catch {
    showError("Server error");
  }
}

// ==========================
// DISTORTED CAPTCHA
// ==========================
function drawCaptcha(text) {
  const canvas = document.getElementById("captchaCanvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 220, Math.random() * 70);
    ctx.lineTo(Math.random() * 220, Math.random() * 70);
    ctx.strokeStyle = "#ccc";
    ctx.stroke();
  }

  for (let i = 0; i < text.length; i++) {
    const x = 20 + i * 35;
    const y = 40 + Math.random() * 10;
    const angle = (Math.random() - 0.5) * 0.5;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#111";
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }

  for (let i = 0; i < 30; i++) {
    ctx.fillRect(Math.random() * 220, Math.random() * 70, 2, 2);
  }
}

// ==========================
// IMAGE VERIFY
// ==========================
function getSelectedImages() {
  return [...document.querySelectorAll("#imageGrid img")]
    .map((img, i) => img.classList.contains("selected") ? i : null)
    .filter(v => v !== null);
}

// ==========================
// SLIDER CAPTCHA
// ==========================
function initSlider() {
  const btn = document.getElementById("sliderBtn");
  const track = document.getElementById("sliderTrack");
  const box = document.getElementById("sliderBox");

  btn.style.left = "0px";
  track.style.width = "0px";

  let dragging = false;

  btn.onmousedown = () => dragging = true;

  document.onmouseup = () => {
    if (!dragging) return;

    if (btn.offsetLeft > 250) {
      showSuccess();
    } else {
      resetSlider(btn, track);
    }

    dragging = false;
  };

  document.onmousemove = (e) => {
    if (!dragging) return;

    let x = e.clientX - box.getBoundingClientRect().left;

    if (x < 0) x = 0;
    if (x > 300) x = 300;

    btn.style.left = x + "px";
    track.style.width = x + "px";
  };
}

// ==========================
// PUZZLE CAPTCHA
// ==========================
function initPuzzle() {
  const btn = document.getElementById("puzzleBtn");
  const track = document.getElementById("puzzleTrack");
  const box = document.getElementById("puzzleBox");

  btn.style.left = "0px";
  track.style.width = "0px";

  let dragging = false;

  btn.onmousedown = () => dragging = true;

  document.onmouseup = () => {
    if (!dragging) return;

    if (btn.offsetLeft > 240) {
      showSuccess();
    } else {
      resetSlider(btn, track);
    }

    dragging = false;
  };

  document.onmousemove = (e) => {
    if (!dragging) return;

    let x = e.clientX - box.getBoundingClientRect().left;

    if (x < 0) x = 0;
    if (x > 300) x = 300;

    btn.style.left = x + "px";
    track.style.width = x + "px";
  };
}

function resetSlider(btn, track) {
  btn.style.left = "0px";
  track.style.width = "0px";
}

// ==========================
// VERIFY
// ==========================
async function verifyCaptcha() {

  // IMAGE CAPTCHA
  if (currentType === "image") {
    const selected = getSelectedImages();

    const res = await fetch(API_URL + "/verify", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ id: currentId, answer: selected })
    });

    const data = await res.json();
    data.success ? showSuccess() : showError("Wrong selection ❌");
    return;
  }

  // SLIDER / PUZZLE handled via drag
  if (currentType === "slider" || currentType === "puzzle") {
    showError("Use slider to verify");
    return;
  }

  const answer = document.getElementById("userInput").value.trim();

  if (!answer) {
    showError("Enter captcha");
    return;
  }

  try {
    const res = await fetch(API_URL + "/verify", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ id: currentId, answer })
    });

    const data = await res.json();

    data.success ? showSuccess() : (showError("Wrong captcha ❌"), loadCaptcha());

  } catch {
    showError("Server error");
  }
}

// ==========================
// POPUPS
// ==========================
function showSuccess() {
  const popup = document.getElementById("popup");
  popup.innerText = "Captcha verified ✅";
  popup.style.background = "#16a34a";
  popup.style.display = "block";

  setTimeout(() => popup.style.display = "none", 2500);
}

function showError(msg) {
  const popup = document.getElementById("popup");
  popup.innerText = msg;
  popup.style.background = "#dc2626";
  popup.style.display = "block";

  setTimeout(() => popup.style.display = "none", 2000);
}
