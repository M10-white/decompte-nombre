let count = 0;
let end = 0;
let interval;
let step = 1;
let isPaused = false;
let speed = 10;

function startTimelapse() {
    count = 0;
    end = parseInt(document.getElementById("target").value, 10);
    speed = parseInt(document.getElementById("speed").value, 10);
    const color = document.getElementById("color").value;
    const font = document.getElementById("font").value;
    const bold = document.getElementById("bold").checked;
    const autoSize = document.getElementById("autoSize").checked;
    const textHeight = parseInt(document.getElementById("textHeight").value, 10);
    const textWidth = parseInt(document.getElementById("textWidth").value, 10);
    const counter = document.getElementById("counter");
    const wrapper = document.getElementById("counter-wrapper");

    if (isNaN(end) || end <= 0) {
      alert("Veuillez entrer un nombre valide.");
      return;
    }

    counter.style.color = color;
    counter.style.fontFamily = font;
    counter.style.fontWeight = bold ? "bold" : "normal";

    if (autoSize) {
      counter.style.fontSize = "200px";
      counter.style.width = "auto";
      counter.style.height = "auto";
      wrapper.style.width = "90vw";
      wrapper.style.height = "50vh";
      wrapper.style.margin = "0 auto";
    } else {
      const fontSize = textHeight ? `${textHeight}px` : "80px";

      counter.style.fontSize = fontSize;
      counter.style.width = "fit-content";
      counter.style.height = "fit-content";
      counter.style.overflow = "visible";

      wrapper.style.width = "auto";
      wrapper.style.height = "auto";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.justifyContent = "center";
      wrapper.style.margin = "0 auto";
      wrapper.style.overflow = "hidden";
    }

    step = Math.max(Math.ceil(end / 300), 1);
    isPaused = false;

    document.getElementById("timelapseOverlay").style.display = "flex";
    runCounter();
  }

function runCounter() {
  const counter = document.getElementById("counter");
  counter.innerText = count;
  counter.style.animation = "pop 0.4s ease";
  if (document.getElementById("autoSize").checked) autoFontSize();

  setTimeout(() => {
    clearInterval(interval);
    interval = setInterval(() => {
      if (!isPaused) {
        count += step;
        if (count >= end) {
          count = end;
          clearInterval(interval);
        }
        counter.innerText = count;
        if (document.getElementById("autoSize").checked) autoFontSize();
      }
    }, speed);
  }, 300);
}

function pauseCounter() {
  isPaused = true;
}

function resumeCounter() {
  isPaused = false;
}

function restartCounter() {
  clearInterval(interval);
  count = 0;
  isPaused = false;
  runCounter();
}

function backToSetup() {
  clearInterval(interval);
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
    counter.scrollWidth < wrapper.clientWidth &&
    counter.scrollHeight < wrapper.clientHeight &&
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