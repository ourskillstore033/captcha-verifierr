let cid = "";
let type = "text";

async function loadCaptcha() {
  type = document.getElementById("type").value;

  if (type === "text") {
    const res = await fetch("/captcha/text");
    const data = await res.json();
    cid = data.id;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,220,70);
    ctx.fillText(data.text, 50,40);
  }

  if (type === "math") {
    const res = await fetch("/captcha/math");
    const data = await res.json();
    cid = data.id;
    mathBox.innerText = data.question;
  }

  if (type === "image") {
    const res = await fetch("/captcha/image");
    const data = await res.json();
    cid = data.id;

    q.innerText = data.question;
    imageGrid.innerHTML = "";

    data.images.forEach((img,i)=>{
      const el = document.createElement("img");
      el.src = img.url;
      el.onclick = ()=>el.classList.toggle("selected");
      imageGrid.appendChild(el);
    });
  }
}

async function verify() {
  const token = document.querySelector('[name="cf-turnstile-response"]').value;

  if (!token) {
    alert("Complete Turnstile verification");
    return;
  }

  let answer;

  if (type === "image") {
    answer = [...imageGrid.children]
      .map((el,i)=>el.classList.contains("selected")?i:null)
      .filter(v=>v!==null);
  } else {
    answer = input.value;
  }

  const res = await fetch("/verify-all", {
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ id:cid, answer, token })
  });

  const data = await res.json();
  alert(data.success ? "Verified ✅" : "Failed ❌");
}

loadCaptcha();
