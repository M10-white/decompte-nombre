let count = 0;
let isPaused = false;
let renderLoop;
let canvas, ctx;

console.log("✅ Script chargé - Mode affichage uniquement");

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startBtn").addEventListener("click", startTimelapse);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") stopTimelapse();
  });
});

function startTimelapse() {
  count = 0;
  isPaused = false;

  document.getElementById("setup").style.display = "none";
  document.getElementById("timelapseOverlay").style.display = "flex";

  setupCanvas(); // Initialisation canvas + contexte
  runCounter();
}

function stopTimelapse() {
  isPaused = true;
  document.getElementById("timelapseOverlay").style.display = "none";
  document.getElementById("setup").style.display = "flex";

  if (canvas) {
    canvas.remove(); // nettoyage DOM
    canvas = null;
    ctx = null;
  }

  cancelAnimationFrame(renderLoop);
}

function setupCanvas() {
  const overlay = document.getElementById("timelapseOverlay");

  canvas = document.createElement("canvas");
  canvas.width = window.innerWidth * 2;
  canvas.height = window.innerHeight * 2;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  canvas.style.position = "absolute";
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "-1"; // en arrière-plan

  ctx = canvas.getContext("2d", { alpha: true });
  ctx.scale(2, 2); // pour compenser le x2
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  overlay.appendChild(canvas);
}

function runCounter() {
  const end = parseInt(document.getElementById("target").value);
  const speed = parseInt(document.getElementById("speed").value);
  const color = document.getElementById("color").value;

  const step = Math.max(Math.ceil(end / 300), 1);
  let lastTime = performance.now();

  function renderFrame(now) {
    if (isPaused) return;

    const elapsed = now - lastTime;
    if (elapsed >= speed) {
      count += step;
      lastTime = now;
      if (count >= end) {
        count = end;
      }
    }

    // Rendu du texte dans le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;

    const fontSize = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    ctx.font = `${fontSize}px OPTIGamma, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(count.toString(), window.innerWidth / 2, window.innerHeight / 2);

    if (count < end) {
      renderLoop = requestAnimationFrame(renderFrame);
    }
  }

  renderLoop = requestAnimationFrame(renderFrame);
}
