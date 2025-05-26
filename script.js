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
let isLoading = false;
let totalPages = 0;

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
    renderNextPage();
  });
}

function renderNextPage() {
  if (isLoading || currentPage > totalPages) return;

  isLoading = true;
  loading.style.display = "block";

  pdfDoc.getPage(currentPage).then((page) => {
    const viewport = page.getViewport({ scale: 1.5 });
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
        viewer.appendChild(canvas);
        currentPage++;
        isLoading = false;

        if (currentPage > totalPages) {
          loading.textContent = "Barchasi yuklandi ✅";
        }
      });
  });
}

// ✅ IntersectionObserver bilan yuklash
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !isLoading) {
      renderNextPage();
    }
  });
});

observer.observe(loading);

// Til tanlanganda
languageSelect.addEventListener("change", () => {
  observer.unobserve(loading); // qayta observerni yangilaymiz
  loadPDF(languageSelect.value);
  observer.observe(loading);
});

// Boshlanishida
loadPDF("uz");
