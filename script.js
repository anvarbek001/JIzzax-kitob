/** @format */

const viewer = document.getElementById("pdf-viewer");
const loading = document.getElementById("loading");
const languageSelect = document.getElementById("language");
const title = document.getElementById("title");

const translations = {
  uz: {
    file: "pdfs/book-uz.pdf",
    title: "Jizzax mo‘jizalar o‘lkasi",
  },
  ru: {
    file: "pdfs/book-ru.pdf",
    title: "Джизак, страна чудес",
  },
  en: {
    file: "pdfs/book-en.pdf",
    title: "Jizzakh, a wonderland",
  },
};

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let isLoading = false;

function isMobile() {
  return window.innerWidth <= 768;
}

function loadPDF(langCode) {
  const data = translations[langCode];
  title.textContent = data.title;
  viewer.innerHTML = "";
  currentPage = 1;
  isLoading = false;
  loading.textContent = "Yuklanmoqda...";
  loading.style.display = "block";

  pdfjsLib.getDocument(data.file).promise.then((pdf) => {
    pdfDoc = pdf;
    totalPages = pdf.numPages;
    renderMultiplePages(3); // start with first 3 pages
  });
}

function renderMultiplePages(count = 2) {
  if (isLoading || currentPage > totalPages) return;

  isLoading = true;
  loading.style.display = "block";

  let pagesRendered = 0;

  for (let i = 0; i < count && currentPage <= totalPages; i++, currentPage++) {
    pdfDoc.getPage(currentPage).then((page) => {
      const viewport = page.getViewport({ scale: isMobile() ? 0.8 : 1.2 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      page
        .render({
          canvasContext: ctx,
          viewport: viewport,
        })
        .promise.then(() => {
          // Convert canvas to <img> for memory efficiency
          const img = document.createElement("img");
          img.src = canvas.toDataURL("image/webp");
          img.style.width = "100%";
          viewer.appendChild(img);
          canvas.remove(); // free memory

          pagesRendered++;

          if (pagesRendered === count || currentPage > totalPages) {
            isLoading = false;
            if (currentPage > totalPages) {
              loading.textContent = "Barchasi yuklandi ✅";
            }
          }
        });
    });
  }
}

// IntersectionObserver for infinite scroll
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !isLoading) {
        renderMultiplePages(2);
      }
    });
  });

  observer.observe(loading);

  languageSelect.addEventListener("change", () => {
    observer.unobserve(loading);
    loadPDF(languageSelect.value);
    observer.observe(loading);
  });
} else {
  // Fallback for old mobile browsers
  window.addEventListener("scroll", () => {
    const rect = loading.getBoundingClientRect();
    if (rect.top < window.innerHeight && !isLoading) {
      renderMultiplePages(2);
    }
  });

  languageSelect.addEventListener("change", () => {
    loadPDF(languageSelect.value);
  });
}

// Initial load
loadPDF("uz");
