let recorder, stream;
let frames = [];
let isPaused = false;
let lastFrameTime = 0;
let finalNumber = 0;

const counter = document.getElementById("counter");
const counterWrapper = document.getElementById("counter-wrapper");
const setup = document.getElementById("setup");
const overlay = document.getElementById("timelapseOverlay");
const exportBtn = document.getElementById("exportBtn");

function toggleSizeInputs() {
  const autoSize = document.getElementById("autoSize").checked;
  document.getElementById("textHeightGroup").style.display = autoSize ? "none" : "block";
  document.getElementById("textWidthGroup").style.display = autoSize ? "none" : "block";
}

function applyCounterStyles() {
  const color = document.getElementById("color").value;
  const font = document.getElementById("font").value;
  const bold = document.getElementById("bold").checked;
  const textHeight = document.getElementById("textHeight").value;
  const textWidth = document.getElementById("textWidth").value;
  const autoSize = document.getElementById("autoSize").checked;

  counter.style.color = color;
  counter.style.fontFamily = font;
  counter.style.fontWeight = bold ? "bold" : "normal";

  if (!autoSize && textHeight && textWidth) {
    counter.style.fontSize = `${textHeight}px`;
    counter.style.width = `${textWidth}px`;
  } else {
    counter.style.fontSize = "10vw";
    counter.style.width = "auto";
  }
}

function updateCounter(value) {
  counter.innerText = value;
  applyCounterStyles();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startTimelapse() {
  document.getElementById("loadingOverlay").classList.remove("hidden");

  finalNumber = parseInt(document.getElementById("target").value);
  const speed = parseInt(document.getElementById("speed").value);

  applyCounterStyles();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const autoSize = document.getElementById("autoSize").checked;

  const width = autoSize ? 800 : parseInt(document.getElementById("textWidth").value) || 800;
  const height = autoSize ? 400 : parseInt(document.getElementById("textHeight").value) || 400;

  canvas.width = width;
  canvas.height = height;

  const streamCanvas = canvas.captureStream();
  recorder = new MediaRecorder(streamCanvas, { mimeType: "video/webm" });
  frames = [];

  recorder.ondataavailable = (e) => e.data.size && frames.push(e.data);
  recorder.start();

  overlay.style.display = "flex";
  setup.style.display = "none";
  exportBtn.style.display = "none";

  const color = document.getElementById("color").value;
  const font = document.getElementById("font").value;
  const bold = document.getElementById("bold").checked;

  for (let i = 0; i <= finalNumber; i++) {
    if (isPaused) {
      i--;
      await sleep(100);
      continue;
    }

    counter.innerText = i;
    applyCounterStyles();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${bold ? "bold " : ""}${autoSize ? Math.floor(canvas.height / 2) : parseInt(document.getElementById("textHeight").value)}px ${font}`;
    ctx.fillText(i, canvas.width / 2, canvas.height / 2);

    await sleep(speed);
  }

  recorder.stop();
  recorder.onstop = () => {
    stream = new Blob(frames, { type: "video/webm" });
    exportBtn.style.display = "inline-block";
  };

  document.getElementById("loadingOverlay").classList.add("hidden");
}

function pauseCounter() {
  isPaused = true;
}
function resumeCounter() {
  isPaused = false;
}
function restartCounter() {
  location.reload();
}
function backToSetup() {
  overlay.style.display = "none";
  setup.style.display = "block";
}

async function downloadRecording() {
  document.getElementById("exportOverlay").classList.remove("hidden");

  const format = document.getElementById("format").value;
  const formData = new FormData();
  formData.append("video", stream, "recording.webm");

  try {
    const response = await fetch(`https://timelapse-counter-production.up.railway.app/convert?format=${format}`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("Conversion failed");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timelapse.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Conversion failed", error);
    alert("Une erreur est survenue.");
  }

  document.getElementById("exportOverlay").classList.add("hidden");
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loadingOverlay").classList.add("hidden");
  document.getElementById("exportOverlay").classList.add("hidden");
});
