const coverUpload = document.getElementById("coverUpload");

const bookMockup = document.getElementById("bookMockup");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const resetViewBtn = document.getElementById("resetViewBtn");
const statusText = document.getElementById("statusText");
const thicknessRange = document.getElementById("thicknessRange");
const angleRange = document.getElementById("angleRange");
const tiltXRange = document.getElementById("tiltXRange");
const tiltYRange = document.getElementById("tiltYRange");
const shadowBlurRange = document.getElementById("shadowBlurRange");
const shadowOpacityRange = document.getElementById("shadowOpacityRange");
const perspectiveRange = document.getElementById("perspectiveRange");

const defaultView = {
  thickness: 44,
  tiltX: 1,
  tiltY: -17,
  shadowBlur: 5,
  shadowOpacity: 28,
  perspective: 1100
};

let coverDataUrl = "";
let coverImage = null;

coverUpload.addEventListener("change", handleCoverUpload);
downloadBtn.addEventListener("click", downloadMockup);
resetBtn.addEventListener("click", resetMockup);
thicknessRange.addEventListener("input", updateMockupControls);
angleRange.addEventListener("input", updateMockupControls);
resetViewBtn.addEventListener("click", resetView);

[
  thicknessRange,
  tiltXRange,
  tiltYRange,
  shadowBlurRange,
  shadowOpacityRange,
  perspectiveRange
].forEach((control) => control.addEventListener("input", updateMockupControls));

updateMockupControls();


function updateMockupControls() {
  document.documentElement.style.setProperty("--book-depth", `${thicknessRange.value}px`);
  document.documentElement.style.setProperty("--book-angle", `${angleRange.value}deg`);
  document.documentElement.style.setProperty("--tilt-x", `${tiltXRange.value}deg`);
  document.documentElement.style.setProperty("--tilt-y", `${tiltYRange.value}deg`);
  document.documentElement.style.setProperty("--shadow-blur", `${shadowBlurRange.value}px`);
  document.documentElement.style.setProperty("--shadow-opacity", shadowOpacityRange.value / 100);
  document.documentElement.style.setProperty("--shadow-soft-opacity", (shadowOpacityRange.value / 100) * 0.58);
  document.documentElement.style.setProperty("--scene-perspective", `${perspectiveRange.value}px`);
}

function resetMockup() {
  document.documentElement.style.setProperty("--cover-image", "none");
  bookMockup.classList.add("empty");
  downloadBtn.disabled = true;
  thicknessRange.value = 44;
  angleRange.value = -17;
  updateMockupControls();
  resetViewValues();
  setStatus("Choose a cover image to begin.");
}

function resetView() {
  resetViewValues();
  setStatus(coverImage ? "View settings reset." : "View settings reset. Choose a cover image to begin.");
}

function resetViewValues() {
  thicknessRange.value = defaultView.thickness;
  tiltXRange.value = defaultView.tiltX;
  tiltYRange.value = defaultView.tiltY;
  shadowBlurRange.value = defaultView.shadowBlur;
  shadowOpacityRange.value = defaultView.shadowOpacity;
  perspectiveRange.value = defaultView.perspective;
  updateMockupControls();
}

function setStatus(message) {
  statusText.textContent = message;
}

function drawExportMockup(ctx, canvasWidth, canvasHeight) {
  const thickness = Number(thicknessRange.value);
  const angleStrength = Math.abs(Number(angleRange.value));
  const tiltX = Number(tiltXRange.value);
  const tiltY = Number(tiltYRange.value);
  const shadowBlur = Number(shadowBlurRange.value);
  const shadowOpacity = Number(shadowOpacityRange.value) / 100;
  const perspectiveScale = Number(perspectiveRange.value) / defaultView.perspective;
  const angleStrength = Math.abs(tiltY);
  const coverWidth = 335;
  const coverHeight = 510;
  const lean = 34 + angleStrength * 0.65;
  const depth = thickness * 1.35;
  const lean = 34 + angleStrength * 0.65 - tiltX * 0.9;
  const topSkew = 18 + tiltX * 0.8;
  const depth = thickness * 1.35 / perspectiveScale;
  const x = 300;
  const y = 150;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const pagePoly = [
    [x + coverWidth, y + 18],
    [x + coverWidth + depth, y + 50],
    [x + coverWidth + depth - 6, y + coverHeight + 26],
    [x + coverWidth, y + topSkew],
    [x + coverWidth + depth, y + topSkew + 32],
    [x + coverWidth + depth - 6, y + coverHeight + 26 - tiltX],
    [x + coverWidth, y + coverHeight]
  ];
  const coverPoly = [
    [x, y],
    [x + coverWidth, y + 18],
    [x + coverWidth, y + topSkew],
    [x + coverWidth, y + coverHeight],
    [x, y + coverHeight - lean]
  ];
  ];

  drawSoftBackground(ctx, canvasWidth, canvasHeight);
  drawShadow(ctx, x + 210, y + coverHeight + 75, 470, 90);
  drawShadow(ctx, x + 210, y + coverHeight + 75, 470, 90, shadowBlur, shadowOpacity);
  drawPolygon(ctx, pagePoly, "#efe3c8");
  drawPageLines(ctx, pagePoly, 18);
  drawCoverSide(ctx, spinePoly);
  ctx.fillRect(0, 0, width, height);
}

function drawShadow(ctx, x, y, width, height) {
function drawShadow(ctx, x, y, width, height, blur, opacity) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, 0.35);
  const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, width / 2);
  gradient.addColorStop(0, "rgba(15, 23, 42, 0.28)");
  gradient.addColorStop(0.55, "rgba(15, 23, 42, 0.13)");
  gradient.addColorStop(0, `rgba(15, 23, 42, ${opacity})`);
  gradient.addColorStop(0.55, `rgba(15, 23, 42, ${opacity * 0.46})`);
  gradient.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.filter = `blur(${blur}px)`;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, width / 2, height, 0, 0, Math.PI * 2);
