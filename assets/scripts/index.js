let animationId;

function startCounter() {
  cancelAnimationFrame(animationId); // reset si relancé
  let count = 0;
  const end = parseInt(document.getElementById("target").value, 10);
  const counter = document.getElementById("counter");

  if (isNaN(end) || end <= 0) {
    alert("Veuillez entrer un nombre valide > 0");
    return;
  }

  const step = Math.ceil(end / 300); // approx 300 frames
  const speed = 1; // ms, requestAnimationFrame ignore ce paramètre

  function updateCounter() {
    count += step;
    if (count >= end) {
      counter.innerText = end;
      return;
    }
    counter.innerText = count;
    animationId = requestAnimationFrame(updateCounter);
  }

  counter.innerText = 0;
  updateCounter();
}