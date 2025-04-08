let recordedChunks = [];
let mediaRecorder;
let canvasStream;
let renderInterval;
let count = 0;
let isPaused = false;

console.log("✅ Script chargé correctement");

window.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM ready");
  document.getElementById("loadingOverlay").classList.add("hidden");
  document.getElementById("exportOverlay").classList.add("hidden");
});

const loadingOverlay = document.createElement("div");
loadingOverlay.id = "loadingOverlay";
loadingOverlay.style = `
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8); z-index: 9999;
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-family: sans-serif; display: none;
`;
loadingOverlay.textContent = "Chargement...";
document.body.appendChild(loadingOverlay);

function showLoading(text = "Chargement...") {
  loadingOverlay.textContent = text;
  loadingOverlay.style.display = "flex";
}

function hideLoading() {
  loadingOverlay.style.display = "none";
}

function startTimelapse() {
  count = 0;
  isPaused = false;
  showLoading("Préparation du timelapse...");
  setTimeout(() => {
    setupCanvas();

    document.getElementById("counter").style.color = document.getElementById("color").value;

    startRecording();
    document.getElementById("timelapseOverlay").style.display = "flex";
    hideLoading();
    runCounter();
  }, 300);
}


function setupCanvas() {
  const counter = document.getElementById("counter");
  const autoSize = document.getElementById("autoSize").checked;
  const textHeight = parseInt(document.getElementById("textHeight").value, 10);
  const textWidth = parseInt(document.getElementById("textWidth").value, 10);
  const scale = 3;

  const canvas = document.createElement("canvas");
  canvas.width = autoSize ? 1280 : (textWidth || 600) * scale;
  canvas.height = autoSize ? 720 : (textHeight || 300) * scale;

  canvasStream = canvas.captureStream();
  const ctx = canvas.getContext("2d", { alpha: true });
  canvas.style.backgroundColor = "transparent";
  canvas.style.opacity = "1";
  canvas.style.background = "transparent";
  canvas.style.display = "none";

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
  }, 1000 / 30);
}

function startRecording() {
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(canvasStream, { mimeType: "video/webm" });
  mediaRecorder.ondataavailable = function (e) {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };
  mediaRecorder.start();
}

async function downloadRecording() {
  const format = document.getElementById("format").value;
  if (recordedChunks.length === 0) return;

  showLoading("Conversion de la vidéo...");

  const blob = new Blob(recordedChunks, { type: "video/webm" });

  if (format === "webm") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timelapse.webm";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    hideLoading();
  } else {
    const formData = new FormData();
    formData.append("video", blob);

    try {
      const res = await fetch(`/convert?format=${format}`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Conversion failed");

      const convertedBlob = await res.blob();
      const url = URL.createObjectURL(convertedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timelapse.${format}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Conversion failed", err);
      alert("La conversion a échoué.");
    } finally {
      hideLoading();
    }
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    clearInterval(renderInterval);
    document.getElementById("exportBtn").style.display = "inline-block";
  }
}

function runCounter() {
  const counter = document.getElementById("counter");
  const end = parseInt(document.getElementById("target").value);
  const speed = parseInt(document.getElementById("speed").value);
  counter.innerText = count;
  document.getElementById("exportBtn").style.display = "none";
  if (document.getElementById("autoSize").checked) autoFontSize();
  counter.style.animation = "pop 0.4s ease";

  const step = Math.max(Math.ceil(end / 300), 1);
  let lastTime = performance.now();

  function animate(now) {
    if (isPaused) {
      lastTime = now;
      requestAnimationFrame(animate);
      return;
    }

    const elapsed = now - lastTime;
    if (elapsed >= speed) {
      count += step;
      lastTime = now;

      if (count >= end) {
        count = end;
        counter.innerText = count;
        if (document.getElementById("autoSize").checked) autoFontSize();
        stopRecording();
        return;
      }

      counter.innerText = count;
      if (document.getElementById("autoSize").checked) autoFontSize();
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function pauseCounter() { isPaused = true; }
function resumeCounter() { isPaused = false; }
function restartCounter() {
  count = 0;
  isPaused = false;
  runCounter();
}
function backToSetup() {
  stopRecording();
  document.getElementById("timelapseOverlay").style.display = "none";
}
document.addEventListener("keydown", (e) => {
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
  counter.style.fontSize = fontSize - 1 + "px";
}
function toggleSizeInputs() {
  const autoSize = document.getElementById("autoSize").checked;
  document.getElementById("textHeightGroup").style.display = autoSize ? "none" : "flex";
  document.getElementById("textWidthGroup").style.display = autoSize ? "none" : "flex";
}
window.onload = toggleSizeInputs;
