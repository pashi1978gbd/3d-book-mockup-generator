const coverUpload = document.getElementById("coverUpload");
const bookMockup = document.getElementById("bookMockup");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const statusText = document.getElementById("statusText");
const thicknessRange = document.getElementById("thicknessRange");
const angleRange = document.getElementById("angleRange");

let coverDataUrl = "";
let coverImage = null;

coverUpload.addEventListener("change", handleCoverUpload);
downloadBtn.addEventListener("click", downloadMockup);
resetBtn.addEventListener("click", resetMockup);
thicknessRange.addEventListener("input", updateMockupControls);
angleRange.addEventListener("input", updateMockupControls);

updateMockupControls();

function handleCoverUpload(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setStatus("Please choose a valid image file.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    coverDataUrl = reader.result;
    coverImage = new Image();
    coverImage.onload = () => {
      document.documentElement.style.setProperty("--cover-image", `url("${coverDataUrl}")`);
      bookMockup.classList.remove("empty");
      downloadBtn.disabled = false;
      setStatus(`${file.name} is ready for export.`);
    };
    coverImage.src = coverDataUrl;
  };

  reader.onerror = () => setStatus("The cover could not be loaded. Try another image.");
  reader.readAsDataURL(file);
}

function updateMockupControls() {
  document.documentElement.style.setProperty("--book-depth", `${thicknessRange.value}px`);
  document.documentElement.style.setProperty("--book-angle", `${angleRange.value}deg`);
}

function resetMockup() {
  coverUpload.value = "";
  coverDataUrl = "";
  coverImage = null;
  document.documentElement.style.setProperty("--cover-image", "none");
  bookMockup.classList.add("empty");
  downloadBtn.disabled = true;
  thicknessRange.value = 44;
  angleRange.value = -17;
  updateMockupControls();
  setStatus("Choose a cover image to begin.");
}

function setStatus(message) {
  statusText.textContent = message;
}

function downloadMockup() {
  if (!coverImage) {
    setStatus("Upload a cover before downloading.");
    return;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const scale = 3;
  const width = 900;
  const height = 900;

  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);
  ctx.imageSmoothingQuality = "high";

  drawExportMockup(ctx, width, height);

  const link = document.createElement("a");
  link.download = "3d-book-mockup.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
  setStatus("PNG downloaded.");
}

function drawExportMockup(ctx, canvasWidth, canvasHeight) {
  const thickness = Number(thicknessRange.value);
  const angleStrength = Math.abs(Number(angleRange.value));
  const coverWidth = 335;
  const coverHeight = 510;
  const lean = 34 + angleStrength * 0.65;
  const depth = thickness * 1.35;
  const x = 300;
  const y = 150;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const pagePoly = [
    [x + coverWidth, y + 18],
    [x + coverWidth + depth, y + 50],
    [x + coverWidth + depth - 6, y + coverHeight + 26],
    [x + coverWidth, y + coverHeight]
  ];
  const coverPoly = [
    [x, y],
    [x + coverWidth, y + 18],
    [x + coverWidth, y + coverHeight],
    [x, y + coverHeight - lean]
  ];
  const spinePoly = [
    [x - depth * 0.56, y + 42],
    [x, y],
    [x, y + coverHeight - lean],
    [x - depth * 0.56, y + coverHeight - lean + 44]
  ];

  drawSoftBackground(ctx, canvasWidth, canvasHeight);
  drawShadow(ctx, x + 210, y + coverHeight + 75, 470, 90);
  drawPolygon(ctx, pagePoly, "#efe3c8");
  drawPageLines(ctx, pagePoly, 18);
  drawCoverSide(ctx, spinePoly);
  drawCoverImage(ctx, coverPoly);
  drawCoverHighlights(ctx, coverPoly);
}

function drawSoftBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#f8fbfd");
  gradient.addColorStop(0.5, "#eef5f7");
  gradient.addColorStop(1, "#f7faf8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawShadow(ctx, x, y, width, height) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, 0.35);
  const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, width / 2);
  gradient.addColorStop(0, "rgba(15, 23, 42, 0.28)");
  gradient.addColorStop(0.55, "rgba(15, 23, 42, 0.13)");
  gradient.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, width / 2, height, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPolygon(ctx, points, fillStyle) {
  ctx.save();
  createPath(ctx, points);
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

function drawPageLines(ctx, points, count) {
  const leftTop = points[0];
  const rightTop = points[1];
  const rightBottom = points[2];
  const leftBottom = points[3];

  ctx.save();
  createPath(ctx, points);
  ctx.clip();
  ctx.strokeStyle = "rgba(125, 94, 51, 0.24)";
  ctx.lineWidth = 1;

  for (let i = 1; i < count; i += 1) {
    const t = i / count;
    const start = interpolate(leftTop, leftBottom, t);
    const end = interpolate(rightTop, rightBottom, t);
    ctx.beginPath();
    ctx.moveTo(start[0], start[1]);
    ctx.lineTo(end[0], end[1]);
    ctx.stroke();
  }

  const edgeGradient = ctx.createLinearGradient(leftTop[0], 0, rightTop[0], 0);
  edgeGradient.addColorStop(0, "rgba(255,255,255,0.28)");
  edgeGradient.addColorStop(1, "rgba(85,60,32,0.22)");
  ctx.fillStyle = edgeGradient;
  ctx.fillRect(leftTop[0], leftTop[1], rightTop[0] - leftTop[0] + 90, leftBottom[1] - leftTop[1] + 80);
  ctx.restore();
}

function drawCoverSide(ctx, points) {
  ctx.save();
  createPath(ctx, points);
  ctx.clip();
  drawImageCover(ctx, coverImage, points[0][0], points[1][1], 120, points[3][1] - points[1][1] + 10);
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgba(12, 18, 28, 0.42)";
  ctx.fillRect(points[0][0], points[1][1], 160, points[3][1] - points[1][1] + 80);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(points[0][0] + 18, points[1][1], 12, points[3][1] - points[1][1] + 80);
  ctx.restore();
}

function drawCoverImage(ctx, points) {
  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.32)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetX = 18;
  ctx.shadowOffsetY = 24;
  createPath(ctx, points);
  ctx.fillStyle = "#111827";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.clip();
  drawImageCover(ctx, coverImage, points[0][0], points[0][1], points[1][0] - points[0][0], points[3][1] - points[0][1] + 40);
  ctx.restore();
}

function drawCoverHighlights(ctx, points) {
  ctx.save();
  createPath(ctx, points);
  ctx.clip();

  const shade = ctx.createLinearGradient(points[0][0], 0, points[1][0], 0);
  shade.addColorStop(0, "rgba(0,0,0,0.26)");
  shade.addColorStop(0.12, "rgba(0,0,0,0.04)");
  shade.addColorStop(0.78, "rgba(255,255,255,0.04)");
  shade.addColorStop(1, "rgba(255,255,255,0.24)");
  ctx.fillStyle = shade;
  ctx.fillRect(points[0][0], points[0][1], points[1][0] - points[0][0], points[3][1] - points[0][1] + 45);

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawImageCover(ctx, img, x, y, width, height) {
  const imageRatio = img.width / img.height;
  const boxRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let offsetX = 0;
  let offsetY = 0;

  if (imageRatio > boxRatio) {
    drawHeight = height;
    drawWidth = height * imageRatio;
    offsetX = (width - drawWidth) / 2;
  } else {
    drawWidth = width;
    drawHeight = width / imageRatio;
    offsetY = (height - drawHeight) / 2;
  }

  ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
}

function createPath(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();
}

function interpolate(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t
  ];
}
