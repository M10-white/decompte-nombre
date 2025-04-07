let count = 0;
let end = 0;
let isPaused = false;
let speed = 10;
let mediaRecorder;
let recordedChunks = [];
let canvas, ctx, canvasStream;
let renderInterval;

function startTimelapse() {
  count = 0;
  end = parseInt(document.getElementById("target").value, 10);
  speed = parseFloat(document.getElementById("speed").value, 10);
  const color = document.getElementById("color").value;
  const font = document.getElementById("font").value;
  const bold = document.getElementById("bold").checked;
  const counter = document.getElementById("counter");
  const wrapper = document.getElementById("counter-wrapper");

  if (isNaN(end) || end <= 0) {
    alert("Veuillez entrer un nombre valide.");
    return;
  }

  counter.style.color = color;
  counter.style.fontFamily = font;
  counter.style.fontWeight = bold ? "bold" : "normal";
  counter.style.fontSize = "200px";
  counter.style.width = "auto";
  counter.style.height = "auto";
  counter.style.overflow = "visible";

  wrapper.style.width = "90vw";
  wrapper.style.height = "50vh";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.style.margin = "0 auto";
  wrapper.style.overflow = "hidden";

  setupCanvas();
  startRecording();
  document.getElementById("timelapseOverlay").style.display = "flex";
  runCounter();
}

function setupCanvas() {
  const counter = document.getElementById("counter");
  const autoSize = document.getElementById("autoSize").checked;
  const textHeight = parseInt(document.getElementById("textHeight").value, 10);
  const textWidth = parseInt(document.getElementById("textWidth").value, 10);

  canvas = document.createElement("canvas");
  const scale = 3;

  if (autoSize) {
    canvas.width = 1280;
    canvas.height = 720;
  } else {
    canvas.width = (textWidth || 600) * scale;
    canvas.height = (textHeight || 300) * scale;
  }

  ctx = canvas.getContext("2d", { alpha: true });
  canvasStream = canvas.captureStream();

  renderInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const style = window.getComputedStyle(counter);
    const color = style.color;
    const weight = style.fontWeight;
    const family = style.fontFamily;
    const text = counter.innerText;

    let fontSize = 10;
    ctx.font = `${weight} ${fontSize}px ${family}`;
    while (
      fontSize < 1000 &&
      ctx.measureText(text).width < canvas.width * 0.9 &&
      fontSize < canvas.height * 0.9
    ) {
      fontSize++;
      ctx.font = `${weight} ${fontSize}px ${family}`;
    }

    ctx.font = `${fontSize - 1}px ${family}`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }, 1000 / 15);
}

function startRecording() {
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm' });
  mediaRecorder.ondataavailable = function(e) {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };
  mediaRecorder.start();
}

function createExportButton() {
  const existing = document.getElementById("exportBtn");
  if (existing) return;

  const btn = document.createElement("button");
  btn.id = "exportBtn";
  btn.textContent = "Télécharger la vidéo (.webm)";
  btn.className = "neumorphic";
  btn.style.marginTop = "20px";
  btn.onclick = downloadRecording;

  const container = document.querySelector(".view-buttons") || document.body;
  container.appendChild(btn);
}

function downloadRecording() {
  const format = document.getElementById("format").value;

  if (recordedChunks.length === 0) {
    alert("Aucune vidéo enregistrée.");
    return;
  }

  if (format === "webm") {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timelapse.webm";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } else if (format === "mov") {
    alert("🎬 Pour convertir la vidéo en .MOV avec transparence, utilisez cette commande FFmpeg :\\n\\n" +
      "ffmpeg -i timelapse.webm -c:v qtrle -pix_fmt argb timelapse.mov\\n\\n" +
      "💡 Vous pouvez le faire localement ou avec des outils en ligne comme CloudConvert.");
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    clearInterval(renderInterval);
    createExportButton();
  }
}

function runCounter() {
  const counter = document.getElementById("counter");
  counter.innerText = count;
  document.getElementById("exportBtn").style.display = "none";
  if (document.getElementById("autoSize").checked) autoFontSize();
  counter.style.animation = "pop 0.4s ease";

  setTimeout(() => {
    let lastTime = performance.now();
    let elapsed = 0;
    const step = Math.max(Math.ceil(end / 300), 1);

    function animate(now) {
      if (isPaused) {
        lastTime = now;
        requestAnimationFrame(animate);
        return;
      }

      elapsed += now - lastTime;
      lastTime = now;

      if (elapsed >= speed) {
        count += step;
        elapsed = 0;

        if (count >= end) {
          count = end;
          counter.innerText = count;
          if (document.getElementById("autoSize").checked) autoFontSize();
          setTimeout(() => {
            stopRecording();
            document.getElementById("exportBtn").style.display = "inline-block";
          }, 500);
          return;
        }

        counter.innerText = count;
        if (document.getElementById("autoSize").checked) autoFontSize();
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, 300);
}

function pauseCounter() {
  isPaused = true;
}

function resumeCounter() {
  isPaused = false;
}

function restartCounter() {
  count = 0;
  isPaused = false;
  runCounter();
}

function backToSetup() {
  stopRecording();
  document.getElementById("timelapseOverlay").style.display = "none";
}

document.addEventListener('keydown', (e) => {
  if (e.key === "Escape") backToSetup();
});

function autoFontSize() {
  const counter = document.getElementById("counter");
  const wrapper = document.getElementById("counter-wrapper");
  let fontSize = 10;
  counter.style.fontSize = fontSize + "px";

  while (
    counter.scrollWidth < wrapper.clientWidth * 0.95 &&
    counter.scrollHeight < wrapper.clientHeight * 0.95 &&
    fontSize < 1000
  ) {
    fontSize++;
    counter.style.fontSize = fontSize + "px";
  }

  counter.style.fontSize = (fontSize - 1) + "px";
}

function toggleSizeInputs() {
  const autoSize = document.getElementById("autoSize").checked;
  document.getElementById("textHeightGroup").style.display = autoSize ? "none" : "flex";
  document.getElementById("textWidthGroup").style.display = autoSize ? "none" : "flex";
}

window.onload = toggleSizeInputs;