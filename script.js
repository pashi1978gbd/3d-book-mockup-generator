// script.js

const coverUpload = document.getElementById("coverUpload");
const coverFace = document.getElementById("coverFace");

const bookTitle = document.getElementById("bookTitle");
const authorName = document.getElementById("authorName");

const previewTitle = document.getElementById("previewTitle");
const previewAuthor = document.getElementById("previewAuthor");

const tiltRange = document.getElementById("tiltRange");
const shadowRange = document.getElementById("shadowRange");

const book = document.getElementById("book");
const bookShadow = document.getElementById("bookShadow");

const bgSelect = document.getElementById("bgSelect");
const previewArea = document.querySelector(".preview-area");

const exportBtn = document.getElementById("exportBtn");
const captureArea = document.getElementById("captureArea");

// Upload Cover
coverUpload.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    coverFace.innerHTML = `<img src="${e.target.result}" alt="cover">`;
  };

  reader.readAsDataURL(file);
});

// Live Title Update
bookTitle.addEventListener("input", () => {
  previewTitle.textContent = bookTitle.value || "Your Book Title";
});

// Live Author Update
authorName.addEventListener("input", () => {
  previewAuthor.textContent = authorName.value || "Author Name";
});

// Tilt Control
tiltRange.addEventListener("input", () => {
  const val = tiltRange.value;
  book.style.transform = `rotateY(${val * -1}deg) rotateX(0deg)`;
});

// Shadow Control
shadowRange.addEventListener("input", () => {
  const val = shadowRange.value;
  bookShadow.style.filter = `blur(${val}px)`;
  bookShadow.style.opacity = Math.max(0.15, val / 35);
});

// Background Select
bgSelect.addEventListener("change", () => {
  previewArea.classList.remove("dark", "blue");

  if (bgSelect.value === "dark") {
    previewArea.classList.add("dark");
  }

  if (bgSelect.value === "blue") {
    previewArea.classList.add("blue");
  }
});

// Export PNG
exportBtn.addEventListener("click", () => {
  html2canvas(captureArea, {
    backgroundColor: null,
    scale: 2
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "book-mockup.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});
